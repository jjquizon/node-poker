import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // Adjust based on backend
export default socket;