import hashlib

password = "yanasan"
hashed_password = hashlib.sha256(password.encode()).hexdigest()

if __name__ == "__main__":
    print(hashed_password)
