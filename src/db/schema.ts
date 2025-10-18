import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  integer,
  pgEnum,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

// --- Enums ---
export const videoVisibilityEnum = pgEnum("video_visibility", [
  "private",
  "public",
]);
export const reactionTypeEnum = pgEnum("reaction_type", ["like", "dislike"]);

// --- Bảng Users ---
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    bannerUrl: text("banner_url"),
    bannerKey: text("banner_key"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    clerkIdIndex: uniqueIndex("clerk_id_index").on(table.clerkId),
  }),
);
export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);
export const userUpdateSchema = createUpdateSchema(users);

// --- Bảng Categories ---
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    nameIndex: uniqueIndex("name_index").on(table.name),
  }),
);
export const categorySelectSchema = createSelectSchema(categories);
export const categoryInsertSchema = createInsertSchema(categories);
export const categoryUpdateSchema = createUpdateSchema(categories);

// --- Bảng Videos ---
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  muxStatus: text("mux_status"),
  muxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),
  duration: integer("duration").default(0).notNull(),
  visibility: videoVisibilityEnum("visibility").notNull().default("private"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const videoSelectSchema = createSelectSchema(videos);
export const videoInsertSchema = createInsertSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);

// --- Bảng Video Views ---
export const videoViews = pgTable(
  "video_views",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.videoId] }),
  }),
);
export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);

// --- Bảng Video Reactions ---
export const videoReactions = pgTable(
  "video_reactions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    type: reactionTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.videoId] }),
  }),
);
export const videoReactionSelectSchema = createSelectSchema(videoReactions);
export const videoReactionInsertSchema = createInsertSchema(videoReactions);
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions);

// --- Bảng Subscriptions ---
export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: uuid("viewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.viewerId, table.creatorId] }),
  }),
);
export const subscriptionSelectSchema = createSelectSchema(subscriptions);
export const subscriptionInsertSchema = createInsertSchema(subscriptions);
export const subscriptionUpdateSchema = createUpdateSchema(subscriptions);

// --- Bảng Playlists ---
export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const playlistSelectSchema = createSelectSchema(playlists);
export const playlistInsertSchema = createInsertSchema(playlists);
export const playlistUpdateSchema = createUpdateSchema(playlists);

// --- Bảng Playlist Videos ---
export const playlist_videos = pgTable(
  "playlist_videos",
  {
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.playlistId, table.videoId] }),
  }),
);
export const playlistVideoSelectSchema = createSelectSchema(playlist_videos);
export const playlistVideoInsertSchema = createInsertSchema(playlist_videos);
export const playlistVideoUpdateSchema = createUpdateSchema(playlist_videos);

// --- Bảng Comments ---
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: text("value").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"), // Sẽ định nghĩa foreign key bên dưới
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
    parentReference: foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: "comments_parent_id_fk",
    }).onDelete("cascade"),
}));
export const commentSelectSchema = createSelectSchema(comments);
export const commentInsertSchema = createInsertSchema(comments);
export const commentUpdateSchema = createUpdateSchema(comments);

// --- Bảng Comment Reactions ---
export const commentReactions = pgTable(
  "comment_reactions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    type: reactionTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.commentId] }),
  }),
);
export const commentReactionSelectSchema = createSelectSchema(commentReactions);
export const commentReactionInsertSchema = createInsertSchema(commentReactions);
export const commentReactionUpdateSchema = createUpdateSchema(commentReactions);


// --- Định nghĩa Quan hệ (Relations) ---

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videoViews: many(videoViews),
  videoReactions: many(videoReactions),
  commentReactions: many(commentReactions),
  comments: many(comments),
  playlists: many(playlists),
  subscriptions: many(subscriptions, { relationName: "viewer_subscriptions" }),
  subscribers: many(subscriptions, { relationName: "creator_subscribers" }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export const videoRelations = relations(videos, ({ one, many }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  videoViews: many(videoViews),
  videoReactions: many(videoReactions),
  comments: many(comments),
  playlistVideos: many(playlist_videos),
}));

export const videoViewRelations = relations(videoViews, ({ one }) => ({
  user: one(users, { fields: [videoViews.userId], references: [users.id] }),
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
  user: one(users, {
    fields: [videoReactions.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
    relationName: "viewer_subscriptions",
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName: "creator_subscribers",
  }),
}));

export const playlistRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, { fields: [playlists.userId], references: [users.id] }),
  playlistVideos: many(playlist_videos),
}));

export const playlistVideoRelations = relations(playlist_videos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlist_videos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlist_videos.videoId],
    references: [videos.id],
  }),
}));

export const commentRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, {
    relationName: "comment_replies",
  }),
  reactions: many(commentReactions),
}));

export const commentReactionRelations = relations(commentReactions, ({ one }) => ({
    user: one(users, {
        fields: [commentReactions.userId],
        references: [users.id],
    }),
    comment: one(comments, {
        fields: [commentReactions.commentId],
        references: [comments.id],
    }),
}));