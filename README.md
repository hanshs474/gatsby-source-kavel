# gatsby-source-kavel

Kavel is a free AI video generator and AI image generator — 4K clips with sound, and images you can run without an account or a card. This Gatsby source plugin generates images from prompts at build time and exposes them as `KavelImage` nodes, so hero images, placeholders and illustrations come from a prompt in `gatsby-config` instead of a stock site.

No API key is needed to start: without one, builds use [Kavel](https://www.kavel.ai/?utm_source=gatsby&utm_medium=readme)'s free tier (a small daily allowance per machine, watermarked images). Set `KAVEL_API_KEY` (from [kavel.ai/settings/apikeys](https://www.kavel.ai/settings/apikeys)) to run on your account's credits.

## Install

```
npm install gatsby-source-kavel
```

## Configure

```js
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-kavel",
      options: {
        images: [
          { name: "hero", prompt: "a lighthouse at dusk, warm window light, calm sea", aspectRatio: "16:9" },
          { name: "about", prompt: "a tidy desk with a notebook and a coffee cup, top-down" },
        ],
      },
    },
  ],
};
```

`aspectRatio` is `1:1` (default), `16:9`, `9:16`, `4:3` or `3:4`.

## Query

```graphql
{
  kavelImage(name: { eq: "hero" }) {
    url
    prompt
    watermarked
  }
}
```

Each image is generated once per build; keep the list short and cache the build output if you build often.

## Beyond plain prompts

Kavel's web tools wrap tuned prompts around a single input, for example the [tombstone generator](https://www.kavel.ai/image/tombstone-generator?utm_source=gatsby&utm_medium=readme): type an epitaph, get an engraved headstone in a graveyard scene.

## License

MIT
