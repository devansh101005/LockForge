for i in $(seq 1 5); do
  echo "Server-$i attempting lock:"
  curl -s -X POST http://localhost:3000/lock/contested-resource \
    -H "Content-Type: application/json" \
    -d "{\"owner\": \"server-$i\"}" &
done
wait
echo ""
echo "Only one should have succeeded."