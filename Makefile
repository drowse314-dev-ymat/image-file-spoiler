.PHONY: package-image-file-spoiler
package-image-file-spoiler: clean
	mkdir -p ./dist/package
	yarn build
	cp -v ./dist/lambda-image-file-spoiler.js ./dist/package/index.js
	cp -v ./{package.json,yarn.lock} ./dist/package
	cd ./dist/package && yarn install --production
	cd ./dist/package && zip -rq lambda-image-file-spoiler.zip .


.PHONY: clean
clean:
	rm -rf ./dist/package