## Changelog

## [2.0.10](https://github.com/logdna/logdna-browser/compare/v2.0.9...v2.0.10) (2022-06-28)


### Bug Fixes

* **ssr**: Fix the ability to use the logger with SSR frameworks [48cc673](https://github.com/logdna/logdna-browser/commit/48cc673450c5bb6971b5a499b49cf139f3982ace) - Terry Moore

## [2.0.9](https://github.com/logdna/logdna-browser/compare/v2.0.8...v2.0.9) (2022-05-25)


### Bug Fixes

* **doc**: Updated comment [988b705](https://github.com/logdna/logdna-browser/commit/988b705fa2246e8e27ea7e1d99245309f8108336) - Terry Moore


### Miscellaneous

* fix (error): Unhandled promise rejection handler [3166872](https://github.com/logdna/logdna-browser/commit/316687232bd27c220e93b4c09125da6c842b93e1) - Terry Moore

## [2.0.8](https://github.com/logdna/logdna-browser/compare/v2.0.7...v2.0.8) (2022-05-02)


### Bug Fixes

* **unhandledPromise**: `error.message` is overwritten [72fc396](https://github.com/logdna/logdna-browser/commit/72fc396ce0dd427eee05742a965289e74479b746) - Terry Moore, closes: [#38](https://github.com/logdna/logdna-browser/issues/38)

## [2.0.7](https://github.com/logdna/logdna-browser/compare/v2.0.6...v2.0.7) (2022-04-12)


### Bug Fixes

* **error**: Prefix the error type to the log message [7880a82](https://github.com/logdna/logdna-browser/commit/7880a82f6949fbd94d651c899fe953b5c3b502a8) - Terry Moore

## [2.0.6](https://github.com/logdna/logdna-browser/compare/v2.0.5...v2.0.6) (2022-04-06)


### Bug Fixes

* **exceptionhandler**: Better logging of unhandledPromiseRejections [986b902](https://github.com/logdna/logdna-browser/commit/986b902a49b386a166e5cef06a01609df7fb5461) - Terry Moore

## [2.0.5](https://github.com/logdna/logdna-browser/compare/v2.0.4...v2.0.5) (2022-03-21)


### Bug Fixes

* **hooks**: Run hooks with captureError [295cd2b](https://github.com/logdna/logdna-browser/commit/295cd2bca88f50fc38f8b6ad3e7b47e46bfeb3c0) - Terry Moore

## [2.0.4](https://github.com/logdna/logdna-browser/compare/v2.0.3...v2.0.4) (2022-03-21)


### Bug Fixes

* **types**: Change type to lowercase boolean [a957f44](https://github.com/logdna/logdna-browser/commit/a957f4490b796a53698c67006922d213e22e2887) - Terry Moore, closes: [#33](https://github.com/logdna/logdna-browser/issues/33)

## [2.0.3](https://github.com/logdna/logdna-browser/compare/v2.0.2...v2.0.3) (2022-03-18)


### Bug Fixes

* **debug**: Readd debug functionality [24bff12](https://github.com/logdna/logdna-browser/commit/24bff121345f7bab908ddd2a4efd052a07156a6f) - Terry Moore, closes: [#28](https://github.com/logdna/logdna-browser/issues/28)

## [2.0.2](https://github.com/logdna/logdna-browser/compare/v2.0.1...v2.0.2) (2022-03-17)


### Bug Fixes

* **types**: Add types to BeforeSendHook [fc32444](https://github.com/logdna/logdna-browser/commit/fc32444a1157295964619b7e6e754aade5fae27b) - Terry Moore, closes: [#29](https://github.com/logdna/logdna-browser/issues/29)

## [2.0.1](https://github.com/logdna/logdna-browser/compare/v2.0.0...v2.0.1) (2022-03-08)


### Bug Fixes

* **error-check**: Check that error exist [b8f5582](https://github.com/logdna/logdna-browser/commit/b8f55821050d2871a8c042138266bed57e8bd3a3) - Terry Moore

# [2.0.0](https://github.com/logdna/logdna-browser/compare/v1.1.4...v2.0.0) (2022-03-08)


### Features

* **ssr**: Updates to allow SSR (nextjs) support [7c69b91](https://github.com/logdna/logdna-browser/commit/7c69b9190da405cb79e3f944fdcacddf00a005f8) - Terry Moore


### **BREAKING CHANGES**

* **ssr:** This is a large rewrite to abstract any call to window
until after init has run.  This allows for SSR support and better
initialization.

## [1.1.4](https://github.com/logdna/logdna-browser/compare/v1.1.3...v1.1.4) (2021-08-25)

### Bug Fixes

- **package**: Add main to package json file [372bc55](https://github.com/logdna/logdna-browser/commit/372bc553a76b501629bea5fe6303b074b5197e55) - Terry Moore, closes: [#17](https://github.com/logdna/logdna-browser/issues/17) [#20](https://github.com/logdna/logdna-browser/issues/20)

## [1.1.3](https://github.com/logdna/logdna-browser/compare/v1.1.2...v1.1.3) (2021-08-12)

### Bug Fixes

- **offlinecache**: Removal of offline cache [2b9f502](https://github.com/logdna/logdna-browser/commit/2b9f50267b09b5adde4c053466cb7d0d70391110) - Terry Moore

### Miscellaneous

- patch [d8ab420](https://github.com/logdna/logdna-browser/commit/d8ab420527d643b3bb728e64fccf573463ac7535) - Terry Moore

## [1.1.2](https://github.com/logdna/logdna-browser/compare/v1.1.1...v1.1.2) (2021-05-21)

### Chores

- add badges to readme [7088012](https://github.com/logdna/logdna-browser/commit/7088012f3372cadc6301e3bc7282422471d6f8a5) - Terry Moore

## [1.1.1](https://github.com/logdna/logdna-browser/compare/v1.1.0...v1.1.1) (2021-05-19)

### Bug Fixes

- update TS types files for better TS support [8e2a5aa](https://github.com/logdna/logdna-browser/commit/8e2a5aafc960d11dc542be6c660b8766dbac9811) - Terry Moore

# [1.1.0](https://github.com/logdna/logdna-browser/compare/v1.0.3...v1.1.0) (2021-05-12)

### Features

- Add disabled option [373bdb6](https://github.com/logdna/logdna-browser/commit/373bdb67f3ee25bc21788c081879cdb733023939) - Terry Moore

## [1.0.3](https://github.com/logdna/logdna-browser/compare/v1.0.2...v1.0.3) (2021-05-12)

### Bug Fixes

- Localstorage quota limit and less chatty when network error [82e67eb](https://github.com/logdna/logdna-browser/commit/82e67ebc21b88cdaf7a30193c977dfabe82b9e10) - Terry Moore

### Miscellaneous

- Added Beta shield icon [d56f106](https://github.com/logdna/logdna-browser/commit/d56f106e30e76b994b3f13e02a17748b392727cd) - Terry Moore
- Minor README improvements [baa23e4](https://github.com/logdna/logdna-browser/commit/baa23e4ce97933791a22e4c0a87123d2c7297adc) - Michael Shi

## [1.0.2](https://github.com/logdna/logdna-browser/compare/v1.0.1...v1.0.2) (2021-04-26)

### Bug Fixes

- Swap app and hostname values back to original [32438e7](https://github.com/logdna/logdna-browser/commit/32438e70ca23e45983b5d7b71d9995e3fbd9de65) - Terry Moore

## [1.0.1](https://github.com/logdna/logdna-browser/compare/v1.0.0...v1.0.1) (2021-04-22)

### Bug Fixes

- add dist folder to list of packaged files [1515ce8](https://github.com/logdna/logdna-browser/commit/1515ce88a63258788f29aa89513b40758519ddb3) - Terry Moore

# 1.0.0 (2021-04-22)

### Features

- Initial public beta implementation [6ad3390](https://github.com/logdna/logdna-browser/commit/6ad3390df83c0624bd1f61f0749831bbe6c88110) - Terry Moore
- Initial public beta release [00bdcc8](https://github.com/logdna/logdna-browser/commit/00bdcc8f8dabc75e39b226d178ba0cd6f7541399) - Terry Moore

### Miscellaneous

- Initial Commit [260944e](https://github.com/logdna/logdna-browser/commit/260944ec01f2adbe9a671639643cbdc118e2e0ca) - Terry Moore
