# Use Node.js alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy all files to the container
COPY . .

# Install production dependencies
RUN npm install --omit=dev

# Expose the port from app.js (process.env.PORT || 4500)
EXPOSE 4500

# Start the application
CMD ["node", "app.js"]

