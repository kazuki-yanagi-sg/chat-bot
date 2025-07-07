import psycopg2
from passlib.hash import sha256_crypt

hashed = sha256_crypt.hash("yanasan").strip()

conn = psycopg2.connect(
    dbname="yana_db",
    user="yana",
    password="yanasan",
    host="localhost",
    port="5432"
)

cur = conn.cursor()
cur.execute("UPDATE users SET password = %s WHERE name = %s", (hashed, "yana"))
conn.commit()
cur.close()
conn.close()
print("✅ ハッシュを更新しました")
