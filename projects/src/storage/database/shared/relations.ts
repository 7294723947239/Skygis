import { relations } from "drizzle-orm/relations";
import { gisLayers, gisFeatures } from "./schema";

export const gisFeaturesRelations = relations(gisFeatures, ({one}) => ({
	gisLayer: one(gisLayers, {
		fields: [gisFeatures.layerId],
		references: [gisLayers.id]
	}),
}));

export const gisLayersRelations = relations(gisLayers, ({many}) => ({
	gisFeatures: many(gisFeatures),
}));