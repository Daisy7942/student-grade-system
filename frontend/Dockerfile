# 가벼운 Nginx 이미지를 사용하여 정적 파일 서버 구축
FROM nginx:alpine

# 현재 디렉토리의 모든 파일(html, js, css, images 등)을 Nginx 웹 루트로 복사
COPY . /usr/share/nginx/html

# 80번 포트 개방
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
