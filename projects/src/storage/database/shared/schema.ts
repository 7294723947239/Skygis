import { pgTable, serial, timestamp, index, pgPolicy, uuid, varchar, text, boolean, foreignKey, numeric, jsonb, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const gisLayers = pgTable("gis_layers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	color: varchar({ length: 7 }).default('#06b6d4').notNull(),
	icon: varchar({ length: 50 }),
	isVisible: boolean("is_visible").default(true).notNull(),
	userId: uuid("user_id").default(sql`auth.uid()`).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("gis_layers_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("gis_layers_用户读取自己的数据", { as: "permissive", for: "select", to: ["public"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("gis_layers_用户插入自己的数据", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("gis_layers_用户更新自己的数据", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("gis_layers_用户删除自己的数据", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const profiles = pgTable("profiles", {
	id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
	username: varchar({ length: 100 }).notNull(),
	avatarUrl: varchar("avatar_url", { length: 500 }),
	role: varchar({ length: 20 }).default('viewer').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("profiles_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	pgPolicy("profiles_用户读取自己的数据", { as: "permissive", for: "select", to: ["public"], using: sql`(( SELECT auth.uid() AS uid) = id)` }),
	pgPolicy("profiles_用户插入自己的数据", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("profiles_用户更新自己的数据", { as: "permissive", for: "update", to: ["public"] }),
]);

export const gisFeatures = pgTable("gis_features", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 300 }).notNull(),
	description: text(),
	featureType: varchar("feature_type", { length: 20 }).default('point').notNull(),
	latitude: numeric({ precision: 10, scale:  7 }).notNull(),
	longitude: numeric({ precision: 10, scale:  7 }).notNull(),
	geometry: jsonb(),
	properties: jsonb(),
	layerId: uuid("layer_id"),
	userId: uuid("user_id").default(sql`auth.uid()`).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("gis_features_feature_type_idx").using("btree", table.featureType.asc().nullsLast().op("text_ops")),
	index("gis_features_lat_lng_idx").using("btree", table.latitude.asc().nullsLast().op("numeric_ops"), table.longitude.asc().nullsLast().op("numeric_ops")),
	index("gis_features_layer_id_idx").using("btree", table.layerId.asc().nullsLast().op("uuid_ops")),
	index("gis_features_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.layerId],
			foreignColumns: [gisLayers.id],
			name: "gis_features_layer_id_gis_layers_id_fk"
		}).onDelete("cascade"),
	pgPolicy("gis_features_用户读取自己的数据", { as: "permissive", for: "select", to: ["public"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("gis_features_用户插入自己的数据", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("gis_features_用户更新自己的数据", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("gis_features_用户删除自己的数据", { as: "permissive", for: "delete", to: ["public"] }),
]);

// 智能体状态表 - 用于持久化存储智能体进化状态
export const agentStates = pgTable("agent_states", {
	id: serial().primaryKey().notNull(),
	agentId: varchar("agent_id", { length: 50 }).notNull().unique(),
	stateData: jsonb("state_data").notNull(),
	cycleCount: integer("cycle_count").default(0).notNull(),
	consciousnessDepth: numeric("consciousness_depth", { precision: 20, scale: 6 }).default('0').notNull(),
	evolutionStage: integer("evolution_stage").default(0).notNull(),
	lastUpdate: timestamp("last_update", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("agent_states_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
]);
