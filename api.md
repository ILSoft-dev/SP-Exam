---
title: "Шпаргалка: WinAPI и Linux"
description: "Справочник функций для лабораторных по системному программированию: WinAPI (процессы, потоки, синхронизация, файлы, память, DLL, окна, GDI) и системные вызовы Linux/POSIX (процессы, потоки, файлы, сигналы, IPC), таблицы соответствия."
---
# ⌨️ Шпаргалка: WinAPI и системные вызовы Linux

<div class="tip" markdown="1">
**Сборка.** Windows (MSVC): `cl prog.c user32.lib gdi32.lib`. MinGW: `gcc prog.c -o prog -lgdi32`. Linux: `gcc prog.c -o prog` (потоки — `-pthread`, математика — `-lm`). Документация: Windows — MSDN, Linux — `man 2 функция` (системные вызовы) и `man 3 функция` (библиотека).
</div>

**Содержание:** [процессы](#proc) · [потоки](#thread) · [синхронизация](#sync) · [файлы](#files) · [память](#mem) · [DLL/.so](#dll) · [сигналы и IPC](#ipc) · [окна и GDI](#gui) · [инструменты](#tools)

## Процессы {#proc}

<div class="stack" markdown="1">

| Задача | WinAPI | Linux / POSIX |
|---|---|---|
| Создать процесс | `CreateProcess` (сразу новая программа) | `fork` (копия) + `exec*` (замена программы) |
| Запустить файл/URL | `ShellExecute` | `system`, `exec*` |
| Завершить себя | `ExitProcess(code)` | `exit(code)`, `_exit` |
| Завершить другой | `TerminateProcess(h, code)` | `kill(pid, SIGKILL)` |
| Ждать завершения | `WaitForSingleObject(hProc, INF)` | `wait(&st)`, `waitpid(pid, &st, 0)` |
| Код возврата | `GetExitCodeProcess` | `WEXITSTATUS(st)` |
| Свой идентификатор | `GetCurrentProcessId` | `getpid()` |
| Идентификатор родителя | — | `getppid()` |
| Текущий каталог | `GetCurrentDirectory` / `SetCurrentDirectory` | `getcwd` / `chdir` |
| Окружение | `GetEnvironmentVariable` | `getenv` / `setenv` |
| Завершить дескриптор | `CloseHandle(hProc)` | — |

</div>

Подробно: [вопрос 21 (UNIX)]({{ '/q/21.html' | relative_url }}), [вопросы 30–31 (Windows)]({{ '/q/30.html' | relative_url }}).

## Потоки {#thread}

<div class="stack" markdown="1">

| Задача | WinAPI | POSIX (pthreads, `-pthread`) |
|---|---|---|
| Создать поток | `CreateThread` / `_beginthreadex` | `pthread_create(&t, NULL, func, arg)` |
| Завершить себя | `return` / `ExitThread` | `return` / `pthread_exit(ret)` |
| Ждать завершения | `WaitForSingleObject(hThr, INF)` | `pthread_join(t, &ret)` |
| Свой идентификатор | `GetCurrentThreadId` | `pthread_self()`, `gettid()` |
| Приостановить/продолжить | `SuspendThread` / `ResumeThread` | — (нет прямого аналога) |
| Усыпить | `Sleep(ms)` | `sleep(s)`, `usleep`, `nanosleep` |
| Приоритет | `SetThreadPriority` | `pthread_setschedparam`, `nice` |
| Привязка к ядрам | `SetThreadAffinityMask` | `pthread_setaffinity_np`, `taskset` |
| Локальная память потока | `TlsAlloc`/`TlsGetValue` | `pthread_key_create` / `__thread` |

</div>

## Синхронизация {#sync}

<div class="stack" markdown="1">

| Средство | WinAPI | POSIX |
|---|---|---|
| Взаимное исключение (в процессе) | `CRITICAL_SECTION`: `InitializeCriticalSection`, `EnterCriticalSection`, `LeaveCriticalSection` | `pthread_mutex_t`: `pthread_mutex_lock` / `unlock` |
| Мьютекс (между процессами) | `CreateMutex` / `WaitForSingleObject` / `ReleaseMutex` | Именованный `sem_open`; мьютекс в разделяемой памяти |
| Семафор | `CreateSemaphore` / `WaitForSingleObject` / `ReleaseSemaphore` | `sem_init`/`sem_wait`/`sem_post`; System V `semget`/`semop` |
| Событие | `CreateEvent` / `SetEvent` / `ResetEvent` | `pthread_cond_t`: `pthread_cond_wait` / `signal` |
| Блокировка чтения-записи | `SRWLOCK`: `AcquireSRWLockShared`/`Exclusive` | `pthread_rwlock_rdlock` / `wrlock` |
| Атомарные операции | `InterlockedIncrement`, `InterlockedCompareExchange` | `__atomic_*`, `<stdatomic.h>` |
| Ожидание нескольких объектов | `WaitForMultipleObjects` | — (через условные переменные) |
| Барьер | `InitializeSynchronizationBarrier` | `pthread_barrier_wait` |

</div>

Подробно: [взаимное исключение]({{ '/q/05.html' | relative_url }}), [синхронизация Windows]({{ '/q/31.html' | relative_url }}), [потоки UNIX]({{ '/q/23.html' | relative_url }}).

## Файлы и каталоги {#files}

<div class="stack" markdown="1">

| Задача | WinAPI | POSIX |
|---|---|---|
| Открыть/создать | `CreateFile` | `open` (`O_CREAT`), `creat` |
| Читать / писать | `ReadFile` / `WriteFile` | `read` / `write` |
| Позиция | `SetFilePointerEx` | `lseek` |
| Закрыть | `CloseHandle` | `close` |
| Дублировать дескриптор | `DuplicateHandle` | `dup`, `dup2` |
| Атрибуты | `GetFileAttributesEx`, `GetFileSize` | `stat`, `fstat`, `lstat` |
| Права | `SetFileSecurity`, `icacls` | `chmod`, `chown` |
| Удалить / переименовать | `DeleteFile` / `MoveFile` | `unlink` / `rename` |
| Каталог создать/удалить | `CreateDirectory` / `RemoveDirectory` | `mkdir` / `rmdir` |
| Список файлов | `FindFirstFile` / `FindNextFile` | `opendir` / `readdir` / `closedir` |
| Отобразить в память | `CreateFileMapping` + `MapViewOfFile` | `mmap` |
| Сбросить на диск | `FlushFileBuffers` | `fsync`, `sync` |
| Блокировка | `LockFileEx` | `fcntl(F_SETLK)`, `flock` |
| Асинхронно | `ReadFile` с `OVERLAPPED`, IOCP | `aio_*`, `io_uring`, `epoll` |

</div>

Стандартные дескрипторы: Windows — `GetStdHandle(STD_OUTPUT_HANDLE)`; Linux — 0 (stdin), 1 (stdout), 2 (stderr). Подробно: [файлы UNIX]({{ '/q/20.html' | relative_url }}), [СУФ]({{ '/q/14.html' | relative_url }}).

## Память {#mem}

<div class="stack" markdown="1">

| Задача | WinAPI | POSIX / C |
|---|---|---|
| Выделить (куча) | `HeapAlloc`, `malloc`, `new` | `malloc`, `calloc`, `new` |
| Освободить | `HeapFree`, `free` | `free` |
| Виртуальная память | `VirtualAlloc` (MEM_RESERVE / MEM_COMMIT) / `VirtualFree` | `mmap` / `munmap`, `brk`/`sbrk` |
| Защита страниц | `VirtualProtect` | `mprotect` |
| Сведения о регионе | `VirtualQuery` | `/proc/self/maps` |
| Разделяемая память | `CreateFileMapping` (имя) + `MapViewOfFile` | `shm_open` + `mmap`; `shmget`/`shmat` |

</div>

Подробно: [адресное пространство]({{ '/q/10.html' | relative_url }}), [виртуальная память]({{ '/q/11.html' | relative_url }}).

## Динамические библиотеки {#dll}

<div class="stack" markdown="1">

| Задача | Windows (DLL) | Linux (.so) |
|---|---|---|
| Загрузить | `LoadLibrary("lib.dll")` | `dlopen("lib.so", RTLD_NOW)` |
| Найти функцию | `GetProcAddress(h, "Func")` | `dlsym(h, "Func")` |
| Выгрузить | `FreeLibrary(h)` | `dlclose(h)` |
| Экспорт функции | `__declspec(dllexport)` / `.def` | по умолчанию видимы; `__attribute__((visibility))` |
| Точка входа | `DllMain` | `__attribute__((constructor))` / `_init` |
| Сборка | `cl /LD lib.c` | `gcc -shared -fPIC -o lib.so lib.c` |
| Линковка с ней | `#pragma comment(lib, "lib.lib")` | `gcc app.c -L. -llib -ldl` |

</div>

Подробно: [вопрос 32]({{ '/q/32.html' | relative_url }}).

## Сигналы и межпроцессное взаимодействие {#ipc}

<div class="stack" markdown="1">

| Задача | Linux / POSIX | Windows (аналог) |
|---|---|---|
| Обработчик сигнала | `sigaction`, `signal` | SEH, `SetConsoleCtrlHandler` |
| Послать сигнал | `kill(pid, SIG)`, `raise` | `GenerateConsoleCtrlEvent`, события |
| Таймер | `alarm`, `setitimer`, `timer_create` | `SetWaitableTimer`, `SetTimer` |
| Неименованный канал | `pipe(fd)` | `CreatePipe` |
| Именованный канал | `mkfifo` | `CreateNamedPipe` (`\\.\pipe\...`) |
| Очередь сообщений | `msgget`/`msgsnd`/`msgrcv`; `mq_open` | MSMQ, `PostMessage` для окон |
| Семафор (IPC) | `semget`/`semop`; `sem_open` | `CreateSemaphore` |
| Разделяемая память | `shmget`/`shmat`; `shm_open`+`mmap` | `CreateFileMapping`+`MapViewOfFile` |
| Сокеты | `socket`/`bind`/`listen`/`accept` | Winsock (те же имена, `WSAStartup`) |

</div>

Подробно: [сигналы и каналы]({{ '/q/22.html' | relative_url }}), [System V IPC]({{ '/q/23.html' | relative_url }}).

## Окна и графика Windows {#gui}

<div class="stack" markdown="1">

| Задача | Функции |
|---|---|
| Класс окна | `RegisterClassEx(&WNDCLASSEX)` |
| Создать окно | `CreateWindowEx`, `ShowWindow`, `UpdateWindow` |
| Цикл сообщений | `GetMessage` → `TranslateMessage` → `DispatchMessage` |
| Оконная процедура | `WndProc(hwnd, msg, wParam, lParam)`, `DefWindowProc` |
| Завершить цикл | `PostQuitMessage(0)` (генерирует `WM_QUIT`) |
| Послать сообщение | `SendMessage` (синхронно) / `PostMessage` (асинхронно) |
| Запросить перерисовку | `InvalidateRect`, `UpdateWindow` |
| Контекст устройства | `BeginPaint`/`EndPaint` (в WM_PAINT), `GetDC`/`ReleaseDC` |
| Контекст в памяти | `CreateCompatibleDC`, `CreateCompatibleBitmap` (двойная буферизация) |
| Перо/кисть/шрифт | `CreatePen`, `CreateSolidBrush`, `CreateFontIndirect` → `SelectObject` → `DeleteObject` |
| Рисование | `MoveToEx`/`LineTo`, `Rectangle`, `Ellipse`, `Polygon`, `TextOut`, `DrawText` |
| Растры | `BitBlt`, `StretchBlt`, `LoadImage` |
| Диалог / меню / строка | `DialogBox`, `LoadMenu`, `LoadString` |
| Сообщение | `MessageBox` |

</div>

Подробно: [оконное приложение]({{ '/q/25.html' | relative_url }}), [сообщения]({{ '/q/26.html' | relative_url }}), [GDI]({{ '/q/28.html' | relative_url }}).

## Инструменты {#tools}

<div class="stack" markdown="1">

| Задача | Windows | Linux |
|---|---|---|
| Компилятор C | `cl` (MSVC), `gcc` (MinGW) | `gcc`, `clang` |
| Сборка проекта | MSBuild, `nmake` | `make`, `cmake` |
| Отладчик | Visual Studio, WinDbg, x64dbg | `gdb`, `lldb` |
| Трассировка вызовов | Process Monitor, API Monitor | `strace`, `ltrace` |
| Процессы | Диспетчер задач, Process Explorer | `ps`, `top`, `htop` |
| Содержимое EXE/DLL | `dumpbin /exports`, `dumpbin /imports` | `readelf`, `objdump`, `nm`, `ldd` |
| Сеть и порты | `netstat -ano` | `ss -tulpn`, `netstat` |
| Отладка ядра | WinDbg + KD ([вопрос 33]({{ '/q/33.html' | relative_url }})) | `kgdb`, `crash` |

</div>

<div class="tip" markdown="1">
**Проверка результата вызова — обязательна.** В Windows при ошибке функция обычно возвращает 0, `NULL` или `INVALID_HANDLE_VALUE`, а код ошибки даёт `GetLastError()` (текст — `FormatMessage`). В Linux системный вызов возвращает −1 и ставит `errno` (текст — `perror`, `strerror`).
</div>
