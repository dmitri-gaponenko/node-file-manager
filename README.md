# node-file-manager
Start programm by command:
```
npm run start -- --username=your_username
```
Press `ctrl + c` or sent `.exit` command to exit.

## Available commands:

### Navigation & working directory

- `up` - Go upper from current directory
- `cd <path_to_directory>` - Go to dedicated folder from current directory
- `ls` - Print in console list of all files and folders in current directory

### Basic operations with files

- `cat <path_to_file>` - Read file and print it's content in console
- `add <new_file_name>` - Create empty file in current working directory
- `rn <path_to_file> <new_filename>` - Rename file
- `cp <path_to_file> <path_to_new_directory>` - Copy file
- `mv <path_to_file> <path_to_new_directory>` - Move file
- `rm <path_to_file>` - Delete file

### Operating system info

- `os --EOL` - Print EOL (default system End-Of-Line) it to console
- `os --cpus` - Print host machine CPUs info (overall amount of CPUS plus model and clock rate (in GHz) for each of them) it to console
- `os --homedir` - Print home directory it to console
- `os --username` - Print current system user name it to console
- `os --architecture` - Print CPU architecture it to console

### Hash calculation

- `hash <path_to_file>` - Calculate hash for file and print it into console

### Compress and decompress operations

- `compress <path_to_file> <path_to_destination>` - Compress file (using Brotli algorithm)
- `decompress <path_to_file> <path_to_destination>` - Decompress file (using Brotli algorithm)
