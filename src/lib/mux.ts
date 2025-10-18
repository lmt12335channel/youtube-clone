import Mux from "@mux/mux-node";

// Khởi tạo Mux client với các key từ file .env.local
export const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});