# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
