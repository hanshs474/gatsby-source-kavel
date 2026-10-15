// Generates one KavelImage node per configured prompt at build time.
// gatsby-config: { resolve: "gatsby-source-kavel", options: { images: [{ name, prompt, aspectRatio }] } }
const { generate } = require("./kavel");

exports.pluginOptionsSchema = ({ Joi }) =>
  Joi.object({
    apiKey: Joi.string().allow("").description("Optional. From https://www.kavel.ai/settings/apikeys; falls back to KAVEL_API_KEY."),
    images: Joi.array()
      .items(Joi.object({ name: Joi.string().required(), prompt: Joi.string().required(), aspectRatio: Joi.string().default("1:1") }))
      .required(),
  });

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest, reporter }, options) => {
  const apiKey = options.apiKey || process.env.KAVEL_API_KEY || "";
  for (const img of options.images || []) {
    const activity = reporter.activityTimer(`kavel: ${img.name}`);
    activity.start();
    try {
      const out = await generate(img.prompt, { apiKey, aspectRatio: img.aspectRatio || "1:1" });
      const data = { name: img.name, prompt: img.prompt, aspectRatio: img.aspectRatio || "1:1", url: out.url, watermarked: out.watermarked };
      actions.createNode({
        ...data,
        id: createNodeId(`kavel-${img.name}`),
        internal: { type: "KavelImage", contentDigest: createContentDigest(data) },
      });
    } catch (e) {
      reporter.panicOnBuild(`gatsby-source-kavel: "${img.name}" failed: ${e.message}`);
    } finally {
      activity.end();
    }
  }
};
