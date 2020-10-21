currentDate="$(date +"M:%m-D:%d-Y:%Y")"
currentDateLong="$(date)"
currentMili="$(($(gdate +%s%N)/1000000))"
mkdir backup-$currentDate
cp -av usergenerated backup-$currentDate
mongodump --db social-media-test --out backup-$currentDate
cd backup-$currentDate
touch backup.txt
echo "Date: $currentDateLong" >> backup.txt