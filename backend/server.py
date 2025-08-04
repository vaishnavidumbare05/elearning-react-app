import sys

# Get the code file passed as an argument
code_file = sys.argv[1]

# Read the code from the file and execute it
with open(code_file, 'r') as f:
    code = f.read()

# Execute the code and capture the output
exec_globals = {}
exec(code, exec_globals)

# Print the result (for simplicity, we'll just print the final variable)
for key, value in exec_globals.items():
    if isinstance(value, (int, float, str)):
        print(f"{key} = {value}")
