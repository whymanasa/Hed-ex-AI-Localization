import express from "express";
import axios from "axios";

const router = express.Router();

// POST /translate
router.post("/", async (req, res) => {
  try {
    const { text, to } = req.body; // we expect { text: "hello", to: "id" }

    const endpoint = process.env.TRANSLATOR_ENDPOINT;
    const apiKey = process.env.TRANSLATOR_KEY;
    const location = process.env.TRANSLATOR_LOCATION;

    const response = await axios({
      baseURL: endpoint,
      url: "/translate",
      method: "post",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Ocp-Apim-Subscription-Region": location,
        "Content-type": "application/json",
      },
      params: {
        "api-version": "3.0",
        to: to, // like 'id' for Indonesian
      },
      data: [
        {
          text: text,
        },
      ],
      responseType: "json",
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.response.data);
    res.status(500).send("Translation failed");
  }
});

export default router;
