(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* global AFRAME */\nif (typeof AFRAME === 'undefined') {\n  throw new Error('Component attempted to register before AFRAME was available.');\n}\n/**\n * Cursor Teleport component for A-Frame.\n */\n\n\nAFRAME.registerComponent('cursor-teleport', {\n  schema: {\n    cameraHead: {\n      type: 'string',\n      default: ''\n    },\n    cameraRig: {\n      type: 'string',\n      default: ''\n    },\n    collisionEntities: {\n      type: 'string',\n      default: ''\n    },\n    ignoreEntities: {\n      type: 'string',\n      default: ''\n    },\n    landingMaxAngle: {\n      default: '45',\n      min: 0,\n      max: 360\n    },\n    landingNormal: {\n      type: 'vec3',\n      default: '0 1 0'\n    }\n  },\n  init: function () {\n    console.log(\"Fixed self\");\n    teleporter = this; // platform detect\n\n    teleporter.mobile = AFRAME.utils.device.isMobile(); // main app\n\n    teleporter.scene = this.el.sceneEl;\n    teleporter.canvas = teleporter.scene.renderer.domElement; // camera\n\n    document.querySelector(this.data.cameraHead).object3D.traverse(function (child) {\n      if (child instanceof THREE.Camera) {\n        teleporter.cam = child;\n      }\n    });\n    teleporter.camPos = new THREE.Vector3();\n    teleporter.camRig = document.querySelector(this.data.cameraRig).object3D;\n    teleporter.camPos = teleporter.camRig.position; //collision\n\n    teleporter.rayCaster = new THREE.Raycaster();\n    teleporter.referenceNormal = new THREE.Vector3();\n    teleporter.rayCastObjects = []; // Update collision normal\n\n    teleporter.referenceNormal.copy(this.data.landingNormal); // RING teleport indicator - original\n\n    var geo = new THREE.RingGeometry(.25, .3, 32, 1);\n    geo.rotateX(-Math.PI / 2);\n    geo.translate(0, .02, 0);\n    var mat = new THREE.MeshBasicMaterial({\n      color: 0x774DEE\n    });\n    var indicatorRing = new THREE.Mesh(geo, mat); // CYLINDER teleport indicator\n\n    var geoCyl = new THREE.CylinderGeometry(.3, .3, .5, 32, 1, true);\n    geoCyl.translate(0, .25, 0);\n    var temp = 'data:image/png;base64,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';\n    const textureCyl = new THREE.TextureLoader().load(temp);\n    var matCyl = new THREE.MeshBasicMaterial({\n      color: 0x774DEE,\n      side: 'double',\n      map: textureCyl,\n      transparent: true,\n      depthTest: false\n    });\n    var indicatorCyl = new THREE.Mesh(geoCyl, matCyl);\n    const group = new THREE.Group();\n    group.add(indicatorRing);\n    group.add(indicatorCyl);\n    teleporter.teleportIndicator = group;\n    teleporter.scene.object3D.add(teleporter.teleportIndicator); // transition\n\n    teleporter.transitioning = false;\n    teleporter.transitionProgress = 0;\n    teleporter.transitionSpeed = .01;\n    teleporter.transitionCamPosStart = new THREE.Vector3();\n    teleporter.transitionCamPosEnd = new THREE.Vector3();\n\n    teleporter.updateRaycastObjects = function () {\n      // updates the array of meshes we will need to raycast to\n      // clear the array of any existing meshes\n      teleporter.rayCastObjects = [];\n\n      if (this.data.collisionEntities != '') {\n        // traverse collision entities and add their meshes to the rayCastEntities array.\n        var collisionEntities = teleporter.scene.querySelectorAll(this.data.collisionEntities);\n        collisionEntities.forEach(e => {\n          e.object3D.traverse(function (child) {\n            if (child instanceof THREE.Mesh) {\n              // mark this mesh as a collision object\n              child.userData.collision = true;\n              teleporter.rayCastObjects.push(child);\n            }\n          });\n        });\n      } else {\n        // if no collision entities are specified, create a default ground plane collision.\n        var geo = new THREE.PlaneGeometry(500, 500, 1);\n        geo.rotateX(-Math.PI / 2);\n        var mat = new THREE.MeshNormalMaterial();\n        var collisionMesh = new THREE.Mesh(geo, mat); // mark this mesh as a collision object\n\n        collisionMesh.userData.collision = true;\n        teleporter.rayCastObjects.push(collisionMesh);\n      } // We may need some entities to be seen by the raycaster even though they are not teleportable.\n      // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.\n\n\n      if (this.data.ignoreEntities != '') {\n        var ignoreEntities = teleporter.scene.querySelectorAll(this.data.ignoreEntities);\n        ignoreEntities.forEach(e => {\n          e.object3D.traverse(function (child) {\n            if (child instanceof THREE.Mesh) {\n              teleporter.rayCastObjects.push(child);\n            }\n          });\n        });\n      }\n    };\n\n    function getMouseState(canvas, e) {\n      var rect = canvas.getBoundingClientRect();\n\n      if (e.clientX != null) {\n        return {\n          x: e.clientX - rect.left,\n          y: e.clientY - rect.top\n        };\n      } else if (e.touches[0] != null) {\n        return {\n          x: e.touches[0].clientX - rect.left,\n          y: e.touches[0].clientY - rect.top\n        };\n      }\n    }\n\n    teleporter.getTeleportPosition = function (mouse_x, mouse_y) {\n      if (teleporter.rayCastObjects.length != 0) {\n        if (teleporter.hasOwnProperty('cam') && teleporter.hasOwnProperty('canvas')) {\n          var cam = teleporter.cam;\n          var rect = teleporter.canvas.getBoundingClientRect();\n          var mouse = new THREE.Vector2();\n          mouse.x = mouse_x / (rect.right - rect.left) * 2 - 1;\n          mouse.y = -(mouse_y / (rect.bottom - rect.top)) * 2 + 1;\n          teleporter.rayCaster.setFromCamera(mouse, cam);\n          var intersects = teleporter.rayCaster.intersectObjects(teleporter.rayCastObjects);\n\n          if (intersects.length != 0 && teleporter.isValidNormalsAngle(intersects[0].face.normal)) {\n            if (intersects[0].object.userData.collision == true) {\n              return intersects[0].point;\n            }\n\n            return false;\n          } else {\n            return false;\n          }\n        } else {\n          return false;\n        }\n      } else {\n        return false;\n      }\n    };\n\n    teleporter.isValidNormalsAngle = function (collisionNormal) {\n      var angleNormals = teleporter.referenceNormal.angleTo(collisionNormal);\n      return THREE.Math.RAD2DEG * angleNormals <= this.data.landingMaxAngle;\n    };\n\n    teleporter.transition = function (destPos) {\n      teleporter.transitionProgress = 0;\n      teleporter.transitionCamPosEnd.x = destPos.x;\n      teleporter.transitionCamPosEnd.y = destPos.y;\n      teleporter.transitionCamPosEnd.z = destPos.z;\n      teleporter.transitionCamPosStart.x = teleporter.camPos.x;\n      teleporter.transitionCamPosStart.y = teleporter.camPos.y;\n      teleporter.transitionCamPosStart.z = teleporter.camPos.z;\n      teleporter.transitioning = true;\n    };\n\n    function mouseMove(e) {\n      var mouseState = getMouseState(teleporter.canvas, e);\n      teleporter.mouseX = mouseState.x;\n      teleporter.mouseY = mouseState.y;\n    }\n\n    function mouseDown(e) {\n      teleporter.updateRaycastObjects();\n      var mouseState = getMouseState(teleporter.canvas, e);\n      teleporter.mouseX = mouseState.x;\n      teleporter.mouseY = mouseState.y;\n      teleporter.mouseXOrig = mouseState.x;\n      teleporter.mouseYOrig = mouseState.y;\n    }\n\n    function mouseUp(e) {\n      if (teleporter.mouseX == teleporter.mouseXOrig && teleporter.mouseY == teleporter.mouseYOrig) {\n        var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);\n\n        if (pos) {\n          teleporter.teleportIndicator.position.x = pos.x;\n          teleporter.teleportIndicator.position.y = pos.y;\n          teleporter.teleportIndicator.position.z = pos.z;\n          teleporter.transition(pos);\n        }\n      }\n    }\n\n    teleporter.updateRaycastObjects(); // event listeners\n\n    teleporter.canvas.addEventListener('mousedown', mouseDown, false);\n    teleporter.canvas.addEventListener('mousemove', mouseMove, false);\n    teleporter.canvas.addEventListener('mouseup', mouseUp, false);\n    teleporter.canvas.addEventListener('touchstart', mouseDown, false);\n    teleporter.canvas.addEventListener('touchmove', mouseMove, false);\n    teleporter.canvas.addEventListener('touchend', mouseUp, false); // helper functions\n\n    teleporter.easeInOutQuad = function (t) {\n      return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;\n    };\n  },\n  tick: function () {\n    if (!teleporter.transitioning && !teleporter.mobile) {\n      var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);\n\n      if (!teleporter.mobile && pos) {\n        teleporter.teleportIndicator.position.x = pos.x;\n        teleporter.teleportIndicator.position.y = pos.y;\n        teleporter.teleportIndicator.position.z = pos.z;\n      }\n    }\n\n    if (teleporter.transitioning) {\n      teleporter.transitionProgress += teleporter.transitionSpeed; // set camera position\n\n      teleporter.camPos.x = teleporter.transitionCamPosStart.x + (teleporter.transitionCamPosEnd.x - teleporter.transitionCamPosStart.x) * teleporter.easeInOutQuad(teleporter.transitionProgress);\n      teleporter.camPos.y = teleporter.transitionCamPosStart.y + (teleporter.transitionCamPosEnd.y - teleporter.transitionCamPosStart.y) * teleporter.easeInOutQuad(teleporter.transitionProgress);\n      teleporter.camPos.z = teleporter.transitionCamPosStart.z + (teleporter.transitionCamPosEnd.z - teleporter.transitionCamPosStart.z) * teleporter.easeInOutQuad(teleporter.transitionProgress);\n\n      if (teleporter.transitionProgress >= 1) {\n        teleporter.transitioning = false;\n      }\n    }\n  }\n});\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

/******/ });
});