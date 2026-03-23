const axios = require("axios");
require("dotenv").config();

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

/**
 * Upload a JSON object to Pinata IPFS
 * @param {Object} jsonData - The JSON data to upload
 * @param {string} name - Name for the pin
 * @returns {Promise<{cid: string, url: string}>} - The CID and gateway URL
 */
async function uploadJsonToIPFS(jsonData, name = "metadata.json") {
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT is not configured in .env");
  }

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      pinataContent: jsonData,
      pinataMetadata: { name }
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`
      }
    }
  );

  const cid = response.data.IpfsHash;
  return {
    cid,
    url: `${PINATA_GATEWAY}/ipfs/${cid}`
  };
}

module.exports = { uploadJsonToIPFS };
