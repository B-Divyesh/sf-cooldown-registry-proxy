#define _GNU_SOURCE

#include <arpa/inet.h>
#include <dlfcn.h>
#include <errno.h>
#include <fcntl.h>
#include <netdb.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/syscall.h>
#include <unistd.h>

static int trace_fd = -1;

__attribute__((constructor)) static void initialize_guard(void) {
    const char *path = getenv("CRP_IO_TRACE");
    if (path != NULL) {
        trace_fd = (int)syscall(SYS_openat, AT_FDCWD, path, O_WRONLY | O_CREAT | O_APPEND, 0600);
    }
}

static void record(const char *kind, const char *value) {
    if (trace_fd < 0 || value == NULL) return;
    char line[4096];
    int length = snprintf(line, sizeof(line), "%s\t%s\n", kind, value);
    if (length > 0) syscall(SYS_write, trace_fd, line, (size_t)length);
}

static bool forbidden_file(const char *path) {
    if (path == NULL) return false;
    const char *prefix = getenv("CRP_FORBIDDEN_PREFIX");
    if (prefix != NULL && path[0] == '/' && strncmp(path, prefix, strlen(prefix)) == 0) return true;
    return getenv("CRP_DENY_RELATIVE") != NULL && path[0] != '/';
}

static mode_t open_mode(int flags, va_list arguments) {
    if ((flags & O_CREAT) != 0 || (flags & O_TMPFILE) == O_TMPFILE) {
        return (mode_t)va_arg(arguments, int);
    }
    return 0;
}

int open(const char *path, int flags, ...) {
    va_list arguments;
    va_start(arguments, flags);
    mode_t mode = open_mode(flags, arguments);
    va_end(arguments);
    record("OPEN", path);
    if (forbidden_file(path)) { errno = EACCES; return -1; }
    return (int)syscall(SYS_openat, AT_FDCWD, path, flags, mode);
}

int open64(const char *path, int flags, ...) {
    va_list arguments;
    va_start(arguments, flags);
    mode_t mode = open_mode(flags, arguments);
    va_end(arguments);
    record("OPEN", path);
    if (forbidden_file(path)) { errno = EACCES; return -1; }
    return (int)syscall(SYS_openat, AT_FDCWD, path, flags, mode);
}

int openat(int directory, const char *path, int flags, ...) {
    va_list arguments;
    va_start(arguments, flags);
    mode_t mode = open_mode(flags, arguments);
    va_end(arguments);
    record("OPENAT", path);
    if (forbidden_file(path)) { errno = EACCES; return -1; }
    return (int)syscall(SYS_openat, directory, path, flags, mode);
}

int openat64(int directory, const char *path, int flags, ...) {
    va_list arguments;
    va_start(arguments, flags);
    mode_t mode = open_mode(flags, arguments);
    va_end(arguments);
    record("OPENAT", path);
    if (forbidden_file(path)) { errno = EACCES; return -1; }
    return (int)syscall(SYS_openat, directory, path, flags, mode);
}

static bool is_loopback(const struct sockaddr *address) {
    if (address == NULL) return false;
    if (address->sa_family == AF_INET) {
        const struct sockaddr_in *ipv4 = (const struct sockaddr_in *)address;
        return (ntohl(ipv4->sin_addr.s_addr) >> 24) == 127;
    }
    if (address->sa_family == AF_INET6) {
        const struct sockaddr_in6 *ipv6 = (const struct sockaddr_in6 *)address;
        return IN6_IS_ADDR_LOOPBACK(&ipv6->sin6_addr);
    }
    return address->sa_family == AF_UNIX;
}

int connect(int socket_fd, const struct sockaddr *address, socklen_t length) {
    char endpoint[INET6_ADDRSTRLEN + 16] = "unknown";
    if (address != NULL && address->sa_family == AF_INET) {
        const struct sockaddr_in *ipv4 = (const struct sockaddr_in *)address;
        char host[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &ipv4->sin_addr, host, sizeof(host));
        snprintf(endpoint, sizeof(endpoint), "%s:%u", host, ntohs(ipv4->sin_port));
    } else if (address != NULL && address->sa_family == AF_INET6) {
        const struct sockaddr_in6 *ipv6 = (const struct sockaddr_in6 *)address;
        char host[INET6_ADDRSTRLEN];
        inet_ntop(AF_INET6, &ipv6->sin6_addr, host, sizeof(host));
        snprintf(endpoint, sizeof(endpoint), "[%s]:%u", host, ntohs(ipv6->sin6_port));
    }
    record("CONNECT", endpoint);
    if (getenv("CRP_LOOPBACK_ONLY") != NULL && !is_loopback(address)) {
        errno = EPERM;
        return -1;
    }
    return (int)syscall(SYS_connect, socket_fd, address, length);
}

int getaddrinfo(const char *node, const char *service, const struct addrinfo *hints, struct addrinfo **result) {
    typedef int (*getaddrinfo_fn)(const char *, const char *, const struct addrinfo *, struct addrinfo **);
    static getaddrinfo_fn next_getaddrinfo = NULL;
    record("DNS", node == NULL ? "(null)" : node);
    if (getenv("CRP_LOOPBACK_ONLY") != NULL && node != NULL &&
        strcmp(node, "localhost") != 0 && strcmp(node, "127.0.0.1") != 0 && strcmp(node, "::1") != 0) {
        return EAI_FAIL;
    }
    if (next_getaddrinfo == NULL) next_getaddrinfo = (getaddrinfo_fn)dlsym(RTLD_NEXT, "getaddrinfo");
    return next_getaddrinfo(node, service, hints, result);
}
