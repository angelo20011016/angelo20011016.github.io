#!/usr/bin/env sh
set -eu

# Copies the current source MongoDB database into the Mac mini test database.
# Required env vars:
#   SOURCE_URI - current source MongoDB URI, for example Atlas production
#   TARGET_URI - Mac mini test MongoDB URI
#
# Optional env vars:
#   SOURCE_DB_NAME - source DB name in the dump directory, defaults to my_website
#   MONGO_CONTAINER - local MongoDB container name, defaults to homelab-mongodb-test

SOURCE_DB_NAME="${SOURCE_DB_NAME:-my_website}"
MONGO_CONTAINER="${MONGO_CONTAINER:-homelab-mongodb-test}"
DUMP_DIR="/tmp/app_test_dump"

if [ -z "${SOURCE_URI:-}" ]; then
  echo "SOURCE_URI is required." >&2
  exit 1
fi

if [ -z "${TARGET_URI:-}" ]; then
  echo "TARGET_URI is required." >&2
  exit 1
fi

docker exec "$MONGO_CONTAINER" sh -lc "rm -rf '$DUMP_DIR'"
docker exec -e SOURCE_URI="$SOURCE_URI" "$MONGO_CONTAINER" \
  sh -lc "mongodump --uri=\"\$SOURCE_URI\" --out='$DUMP_DIR'"
docker exec -e TARGET_URI="$TARGET_URI" "$MONGO_CONTAINER" \
  sh -lc "mongorestore --uri=\"\$TARGET_URI\" --drop '$DUMP_DIR/$SOURCE_DB_NAME'"
docker exec "$MONGO_CONTAINER" sh -lc "rm -rf '$DUMP_DIR'"

echo "Synced $SOURCE_DB_NAME into the target MongoDB database."
