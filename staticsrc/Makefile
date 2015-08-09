
JS_BUILD_DIR=../static/js
JSX_SOURCE_DIR=jsx

all:deps build

deps: 
	npm install

build: jsx-build
    
### Build Static ###

jsx-build:
	echo "Building JSX"
	node_modules/.bin/jsx ${JSX_SOURCE_DIR} ${JS_BUILD_DIR}

### Clean ###

clean:
	echo "Cleaning"
