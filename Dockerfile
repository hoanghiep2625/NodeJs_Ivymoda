# Sử dụng Node.js phiên bản mới nhất
FROM node:18

# Tạo thư mục app trong container
WORKDIR /app

# Copy file package.json và package-lock.json trước (tối ưu cache)
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Mở cổng 2625 (hoặc cổng backend của Long)
EXPOSE 2625

# Chạy ứng dụng
CMD ["node", "src/app.js"]
