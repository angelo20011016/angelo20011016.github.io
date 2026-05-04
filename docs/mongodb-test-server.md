# MongoDB Test Server

This project reads MongoDB from `MONGODB_URI`.

Use the Mac mini Docker MongoDB only for the test environment. Keep production pointed at the current production database.

## Test Connection String

On the test server, set `.env`:

```env
MONGODB_URI="mongodb://angelo:<MONGO_TEST_PASSWORD>@100.90.120.55:27017/app_test?authSource=admin"
```

If the backend container runs on the same Mac mini Docker host, `localhost` from inside the backend container is not the MongoDB container. Use the Tailscale IP above, or put the backend and MongoDB into the same Docker Compose network and use the MongoDB service name.

## Verify MongoDB

```bash
docker exec -it homelab-mongodb-test mongosh -u angelo -p --authenticationDatabase admin
```

Inside `mongosh`:

```javascript
use app_test
db.healthcheck.find()
```

## Copy Current DB Into Test DB

Run these commands on the Mac mini from `~/server/mongodb-test`.

First check whether the MongoDB container already has `mongodump` and `mongorestore`:

```bash
docker exec homelab-mongodb-test mongodump --version
docker exec homelab-mongodb-test mongorestore --version
```

If those commands work, copy the current database into `app_test`:

```bash
SOURCE_URI='<CURRENT_MONGODB_URI>'
TARGET_URI='mongodb://angelo:<MONGO_TEST_PASSWORD>@127.0.0.1:27017/app_test?authSource=admin'

docker exec homelab-mongodb-test sh -lc 'rm -rf /tmp/app_test_dump'
docker exec homelab-mongodb-test sh -lc "mongodump --uri=\"$SOURCE_URI\" --out=/tmp/app_test_dump"
docker exec homelab-mongodb-test sh -lc "mongorestore --uri=\"$TARGET_URI\" --drop /tmp/app_test_dump/my_website"
docker exec homelab-mongodb-test sh -lc 'rm -rf /tmp/app_test_dump'
```

Or use the project script:

```bash
SOURCE_URI='<CURRENT_MONGODB_URI>' \
TARGET_URI='mongodb://angelo:<MONGO_TEST_PASSWORD>@127.0.0.1:27017/app_test?authSource=admin' \
sh scripts/sync_test_mongodb.sh
```

Run the same sync again whenever the test database should be reset to match the current source database. MongoDB collections do not require a SQL-style schema migration when optional fields are added, but destructive or required-field changes should get a small migration script.

If `mongodump` or `mongorestore` is missing, use MongoDB Database Tools through Docker:

```bash
SOURCE_URI='<CURRENT_MONGODB_URI>'
TARGET_URI='mongodb://angelo:<MONGO_TEST_PASSWORD>@homelab-mongodb-test:27017/app_test?authSource=admin'
NETWORK='mongodb-test_default'

docker run --rm --network "$NETWORK" -v mongodb_test_dump:/dump mongodb/mongodb-database-tools:latest \
  mongodump --uri="$SOURCE_URI" --out=/dump

docker run --rm --network "$NETWORK" -v mongodb_test_dump:/dump mongodb/mongodb-database-tools:latest \
  mongorestore --uri="$TARGET_URI" --drop /dump/my_website
```

After restoring, verify:

```bash
docker exec -it homelab-mongodb-test mongosh -u angelo -p --authenticationDatabase admin
```

Inside `mongosh`:

```javascript
use app_test
show collections
db.portfolio.countDocuments()
db.blog_posts.countDocuments()
db.skills.countDocuments()
db.hobbies.countDocuments()
```

## Security Notes

- Store the MongoDB password in a password manager, not plain notes.
- Rotate the current Atlas password because the connection string has appeared in local logs.
- Do not expose port `27017` publicly. Prefer Tailscale or firewall rules that only allow trusted devices.
- If copying production data to test, remove or mask sensitive collections such as contacts, users, and newsletter subscribers when needed.
