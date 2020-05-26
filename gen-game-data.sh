#!/bin/bash
set -o nounset -o errexit -o pipefail

# Generate batches of questions to fill out a Jeopardy board Pick a
# larger sequence range than you think, once you're happy with the
# output, you can set your batch size to account for the 0 byte files
# may get created.

round="1"
batches="$(seq 1 20)"
limit="400"
offset="0" # zero for first iteration only

for x in $batches; do
    localdb <<EOF
\t
\a
\o out-$x-min.json
with games as (
  select q.id, q.question, q.answer, q.value, r.round, c.category, q.air_date
  from questions q
  join rounds r on r.id = q.round_id
  join categories c on c.id = q.category_id
  where round_id = $round and category_id in (
    select id from random_categories_round_$round limit $limit offset $offset
  )
  group by c.category, q.id, c.id, r.id
)
select json_agg(row_to_json(games)) from games;
EOF
    offset="$(($limit * $x))" # increment offset for next batch
done
