# Stage one - install
FROM node:16-alpine as base
ENV NODE_ENV production
ENV GLIBC_VERSION 2.34-r0
ENV LANG en_US.UTF-8

# Install the Lambda runtime and its dependencies, including GLIBC for the Lambda Extensions API
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub \
  && wget -q -O glibc.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/$GLIBC_VERSION/glibc-$GLIBC_VERSION.apk \ 
  && wget -q -O glibc-bin.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/$GLIBC_VERSION/glibc-bin-$GLIBC_VERSION.apk \ 
  && wget -q -O glibc-i18n.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/$GLIBC_VERSION/glibc-i18n-$GLIBC_VERSION.apk

RUN apk add -U autoconf \
  automake \
  build-base \
  cmake \
  curl \
  glibc.apk \
  glibc-bin.apk \
  glibc-i18n.apk \
  libcurl \
  libexecinfo-dev \ 
  libffi-dev \
  libressl-dev \
  libtool \
  make \
  musl-dev \
  python3 \
  rpm2cpio

RUN /usr/glibc-compat/bin/localedef --force --inputfile POSIX --charmap UTF-8 "$LANG" || true
RUN echo "export LANG=$LANG" > /etc/profile.d/locale.sh

# Install Lambda Runtime and Lambda Insights
RUN wget -q -O - https://lambda-insights-extension.s3-ap-northeast-1.amazonaws.com/amazon_linux/lambda-insights-extension.rpm \
  | rpm2cpio \
  | cpio -idmv
RUN npm install -g aws-lambda-ric

# Install application dependencies
WORKDIR /app
COPY package.json /app/
RUN npm install --production

# Copy the source code
COPY src /app

# Stage two, final build
FROM node:16-alpine as final
WORKDIR /app
COPY --from=base /app /app
COPY --from=base /opt /opt
COPY --from=base /usr/local /usr/local
COPY --from=base /usr/glibc-compat /usr/glibc-compat
CMD ["/usr/local/bin/aws-lambda-ric", "index.handler"]
