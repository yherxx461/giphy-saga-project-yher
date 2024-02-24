const express = require('express');
const axios = require('axios');
const pool = require('../modules/pool');
const router = express.Router();
const API_KEY = process.env.API_KEY;

//testing process.env
console.log('API_KEY:', API_KEY);

const BASE_URL_GIPHY = 'api.giphy.com/v1/gifs/search';

// return all favorite images
router.get('/', (req, res) => {
  const sqlText = `SELECT * FROM "favorites" ORDER BY "giphy_image_url";`;
  pool
    .query(sqlText)
    .then((result) => {
      console.log(`Got stuff back from database`, result);
      res.send(result.rows);
    })
    .catch((error) => {
      console.log(`Error in making database query ${sqlText}`, error);
      res.sendStatus(200);
    });
});

// add a new favorite
router.post('/', (req, res) => {
  const { searchTerm } = req.body;
  //? query string comes after the ? key=value&keyTwo=valueTwo = api_key& q represent searchTerm
  axios
    .get(
      `https://${BASE_URL_GIPHY}?api_key=${API_KEY}&q=${searchTerm}&limit=10`
    )
    .then((giphyResponse) => {
      console.log('SUCCESS', giphyResponse.data);
      const simpleResults = giphyResponse.data.data.map((imageData) => {
        return {
          // this is how we like our structure to look like in the front end --> test Postman to make sure this is the structure it's rendering out
          id: imageData.id,
          url: imageData.images.original.url,
          alt: imageData.title,
        };
      });
      res.send(simpleResults);
    })
    .catch((error) => {
      console.log('Error posting giphy search to database', error);
      res.sendStatus(500);
    });
});

//   const sqlText = `INSERT INTO "favorites" ("giphy_image_url", "category_id")
//   VALUES ($1, $2)`;
//   pool
//     .query(sqlText, [favorite.giphy_image_url, favorite.category_id])
//     .then((result) => {
//       console.log(`Added favorite to the database`, favorite);
//       res.sendStatus(201);
//     })
//     .catch((error) => {
//       console.log(`Error making database query ${sqlText}`, error);
//       res.sendStatus(500);
//     });
// });

// update a favorite's associated category
router.put('/:id', (req, res) => {
  // req.body should contain a category_id to add to this favorite image
  const favoriteId = req.params.id;
  const queryText = `UPDATE "favorites" SET "category_id" = NOT "category_id" WHERE "id" = $1;`;
  pool
    .query(queryText, [favoriteId])
    .then((response) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log(`Error in updating the database`, error);
      res.sendStatus(500);
    });
});

// delete a favorite
router.delete('/:id', (req, res) => {
  const favoriteId = req.params.id;
  const queryText = `DELETE FROM "favorites" WHERE "id" = $1;`;
  pool
    .query(queryText, [favoriteId])
    .then((response) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      res.sendStatus(500);
    });
});

module.exports = router;
