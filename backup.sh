currentDate="$(date +"M:%m-D:%d-Y:%Y")"
currentDateLong="$(date)"
currentMili="$(($(gdate +%s%N)/1000000))"
mkdir backup
cd backup
mongodump --db social-media-test --out mongodump
touch backup.txt
echo "Date: $currentDateLong" >> backup.txt
cd ..
zip -r siddesbackup.zip backup
rm -rf backup
