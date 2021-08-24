#!/usr/bin/env bash

# https://gist.github.com/weavenet/f40b09847ac17dd99d16

export AWS_PAGER=""

set -o errexit -o noclobber -o nounset -o pipefail

if [[ "$#" -eq 0 ]]
then
    cat >&2 << 'EOF'
./clear-s3-buckets.bash BUCKET [BUCKET…]

Deletes *all* versions of *all* files in *all* given buckets. Only to be used in case of emergency!
EOF
    exit 1
fi

read -n1 -p "THIS WILL DELETE EVERYTHING IN BUCKETS ${*}! Press Ctrl-c to cancel or anything else to continue: " -r

delete_objects() {
    count="$(jq length <<< "$1")"

    echo "Removing total $count objects..."

    if [[ "$count" -eq 0 ]]
    then
        echo "No objects found; skipping" >&2
        return
    fi

    echo "Removing objects"
    for index in $(seq 0 $(($count - 1)))
    do
        key="$(jq --raw-output ".[${index}].Key" <<< "$1")"
        version_id="$(jq --raw-output ".[${index}].VersionId" <<< "$1")"
        # delete_command=(aws s3api delete-object --bucket="$bucket" --key="$key" --version-id="$version_id")
        delete_command=(aws s3api delete-object --bucket="$bucket" --key="$key")
        printf '%q ' "${delete_command[@]}"
        printf '\n'
        "${delete_command[@]}"
    done
}

for bucket
do
    #echo "Consulting objectss from $bucket"

    versions="$(aws s3api list-object-versions --bucket="$bucket" | jq .Versions)"
    delete_objects "$versions"

    #markers="$(aws s3api list-object-versions --bucket="$bucket" | jq .DeleteMarkers)"
    #delete_objects "$markers"
done