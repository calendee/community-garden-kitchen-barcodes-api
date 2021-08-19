# Cloudflare Workers API for Community Garden Kitchen Barcode Lookups

## Developing

To develop locally, install the project from Github.

Create a `.env.miniflare` file. It will be used to store environment variables during development. It should contain the following:

```
BARCODE_API_URL=https://api.barcodelookup.com/v3/products/
# Get the API key from the https://account.barcodelookup.com site
BARCODE_API_KEY=???
# Use the local domains used for the CGK Barcodes front end while developing. Something like:
ORIGINATING_DOMAINS=http://192.168.40.166:3000||http://localhost:3000/
```

Then, perform the following commands to setup the project for development.

```
yarn
yarn dev
```

The API is then accessible via the URL/Port in the output.

Example:

```
[mf:inf] Listening on :8787
[mf:inf] - http://127.0.0.1:8787
[mf:inf] - http://192.168.40.58:8787
[mf:inf] - http://192.168.40.166:8787
```

If you make changes to the code, Miniflare will not automatically update the API. To solve this, run this command in another terminal:

```
yarn esbuild:watch
```
