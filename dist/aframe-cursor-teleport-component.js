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

eval("/* global AFRAME, THREE */\nif (typeof AFRAME === 'undefined') {\n  throw new Error('Component attempted to register before AFRAME was available.');\n}\n/**\n * Cursor Teleport component for A-Frame.\n */\n\n\nAFRAME.registerComponent('cursor-teleport', {\n  schema: {\n    cameraHead: {\n      type: 'selector',\n      default: ''\n    },\n    cameraRig: {\n      type: 'selector',\n      default: ''\n    },\n    collisionEntities: {\n      type: 'string',\n      default: ''\n    },\n    ignoreEntities: {\n      type: 'string',\n      default: ''\n    },\n    landingMaxAngle: {\n      default: 45,\n      min: 0,\n      max: 360\n    },\n    landingNormal: {\n      type: 'vec3',\n      default: {\n        x: 0,\n        y: 1,\n        z: 0\n      }\n    },\n    transitionSpeed: {\n      type: 'number',\n      default: 0.0006\n    }\n  },\n\n  init() {\n    // platform detect\n    this.mobile = AFRAME.utils.device.isMobile(); // main app\n\n    const sceneEl = this.el.sceneEl;\n    this.canvas = sceneEl.renderer.domElement; // camera\n\n    this.data.cameraHead.object3D.traverse(child => {\n      if (child instanceof THREE.Camera) {\n        this.cam = child;\n      }\n    });\n    this.camRig = this.data.cameraRig.object3D; // collision\n\n    this.rayCaster = new THREE.Raycaster();\n    this.referenceNormal = new THREE.Vector3();\n    this.rayCastObjects = []; // Update collision normal\n\n    this.referenceNormal.copy(this.data.landingNormal); // RING teleport indicator - original\n\n    const geo = new THREE.RingGeometry(0.25, 0.3, 32, 1);\n    geo.rotateX(-Math.PI / 2);\n    geo.translate(0, 0.02, 0);\n    const mat = new THREE.MeshBasicMaterial({\n      color: 0x774dee\n    });\n    const indicatorRing = new THREE.Mesh(geo, mat); // CYLINDER teleport indicator\n\n    const geoCyl = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32, 1, true);\n    geoCyl.translate(0, 0.25, 0); // texture source MIT license https://github.com/fernandojsg/aframe-teleport-controls/blob/master/lib/cylinderTexture.js\n\n    const textureString = 'data:image/png;base64,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';\n    const textureCyl = new THREE.TextureLoader().load(textureString);\n    const matCyl = new THREE.MeshBasicMaterial({\n      color: 0x774dee,\n      side: 'double',\n      map: textureCyl,\n      transparent: true,\n      depthTest: false\n    });\n    const indicatorCyl = new THREE.Mesh(geoCyl, matCyl);\n    const group = new THREE.Group();\n    group.add(indicatorRing);\n    group.add(indicatorCyl);\n    this.teleportIndicator = group;\n    sceneEl.object3D.add(this.teleportIndicator); // transition\n\n    this.transitioning = false;\n    this.transitionProgress = 0;\n    this.transitionCamPosStart = new THREE.Vector3();\n    this.transitionCamPosEnd = new THREE.Vector3(); // Bind functions\n\n    this.updateRaycastObjects = this.updateRaycastObjects.bind(this);\n    this.getMouseState = this.getMouseState.bind(this);\n    this.getTeleportPosition = this.getTeleportPosition.bind(this);\n    this.isValidNormalsAngle = this.isValidNormalsAngle.bind(this);\n    this.transition = this.transition.bind(this);\n    this.mouseMove = this.mouseMove.bind(this);\n    this.mouseDown = this.mouseDown.bind(this);\n    this.mouseUp = this.mouseUp.bind(this);\n    this.easeInOutQuad = this.easeInOutQuad.bind(this);\n    this.updateRaycastObjects();\n  },\n\n  remove() {\n    this.cam = null;\n    this.canvas = null;\n    this.rayCastObjects.length = 0;\n    this.el.sceneEl.object3D.remove(this.teleportIndicator);\n    this.teleportIndicator.children[0].material.dispose();\n    this.teleportIndicator.children[0].geometry.dispose();\n    this.teleportIndicator.children[1].material.dispose();\n    this.teleportIndicator.children[1].geometry.dispose();\n    this.teleportIndicator = null;\n\n    if (this.collisionMesh) {\n      this.collisionMesh.geometry.dispose();\n      this.collisionMesh.material.dispose();\n      this.collisionMesh = null;\n    }\n  },\n\n  play() {\n    const canvas = this.canvas;\n    canvas.addEventListener('mousedown', this.mouseDown, false);\n    canvas.addEventListener('mousemove', this.mouseMove, false);\n    canvas.addEventListener('mouseup', this.mouseUp, false);\n    canvas.addEventListener('touchstart', this.mouseDown, false);\n    canvas.addEventListener('touchmove', this.mouseMove, false);\n    canvas.addEventListener('touchend', this.mouseUp, false);\n  },\n\n  pause() {\n    const canvas = this.canvas;\n    canvas.removeEventListener('mousedown', this.mouseDown);\n    canvas.removeEventListener('mousemove', this.mouseMove);\n    canvas.removeEventListener('mouseup', this.mouseUp);\n    canvas.removeEventListener('touchstart', this.mouseDown);\n    canvas.removeEventListener('touchmove', this.mouseMove);\n    canvas.removeEventListener('touchend', this.mouseUp);\n  },\n\n  updateRaycastObjects() {\n    // updates the array of meshes we will need to raycast to\n    // clear the array of any existing meshes\n    this.rayCastObjects.length = 0;\n\n    if (this.data.collisionEntities !== '') {\n      // traverse collision entities and add their meshes to the rayCastEntities array.\n      const collisionEntities = this.el.sceneEl.querySelectorAll(this.data.collisionEntities);\n      collisionEntities.forEach(e => {\n        e.object3D.traverse(child => {\n          if (child.isMesh) {\n            // mark this mesh as a collision object\n            child.userData.collision = true;\n            this.rayCastObjects.push(child);\n          }\n        });\n      });\n    } else {\n      if (!this.collisionMesh) {\n        // if no collision entities are specified, create a default ground plane collision.\n        const geo = new THREE.PlaneGeometry(500, 500, 1);\n        geo.rotateX(-Math.PI / 2);\n        const mat = new THREE.MeshNormalMaterial();\n        const collisionMesh = new THREE.Mesh(geo, mat); // mark this mesh as a collision object\n\n        collisionMesh.userData.collision = true;\n        this.collisionMesh = collisionMesh;\n      }\n\n      this.rayCastObjects.push(this.collisionMesh);\n    } // We may need some entities to be seen by the raycaster even though they are not teleportable.\n    // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.\n\n\n    if (this.data.ignoreEntities !== '') {\n      const ignoreEntities = this.el.sceneEl.querySelectorAll(this.data.ignoreEntities);\n      ignoreEntities.forEach(e => {\n        e.object3D.traverse(child => {\n          if (child.isMesh) {\n            this.rayCastObjects.push(child);\n          }\n        });\n      });\n    }\n  },\n\n  getMouseState: function () {\n    const coordinates = new THREE.Vector2();\n    return function (e) {\n      const rect = this.canvas.getBoundingClientRect();\n\n      if (e.clientX != null) {\n        coordinates.x = e.clientX - rect.left;\n        coordinates.y = e.clientY - rect.top;\n        return coordinates;\n      } else if (e.touches[0] != null) {\n        coordinates.x = e.touches[0].clientX - rect.left;\n        coordinates.y = e.touches[0].clientY - rect.top;\n        return coordinates;\n      }\n    };\n  }(),\n  getTeleportPosition: function () {\n    const mouse = new THREE.Vector2();\n    return function (mouseX, mouseY) {\n      if (this.rayCastObjects.length !== 0) {\n        if (this.cam && this.canvas) {\n          const cam = this.cam;\n          const rect = this.canvas.getBoundingClientRect();\n          mouse.x = mouseX / (rect.right - rect.left) * 2 - 1;\n          mouse.y = -(mouseY / (rect.bottom - rect.top)) * 2 + 1;\n          this.rayCaster.setFromCamera(mouse, cam);\n          const intersects = this.rayCaster.intersectObjects(this.rayCastObjects);\n\n          if (intersects.length !== 0 && this.isValidNormalsAngle(intersects[0].face.normal)) {\n            if (intersects[0].object.userData.collision === true) {\n              return intersects[0].point;\n            }\n\n            return false;\n          } else {\n            return false;\n          }\n        } else {\n          return false;\n        }\n      } else {\n        return false;\n      }\n    };\n  }(),\n\n  isValidNormalsAngle(collisionNormal) {\n    const angleNormals = this.referenceNormal.angleTo(collisionNormal);\n    return THREE.MathUtils.RAD2DEG * angleNormals <= this.data.landingMaxAngle;\n  },\n\n  transition(destPos) {\n    this.transitionProgress = 0;\n    this.transitionCamPosEnd.copy(destPos);\n    this.transitionCamPosStart.copy(this.camRig.position);\n    this.transitioning = true;\n  },\n\n  mouseMove(e) {\n    const mouseState = this.getMouseState(e);\n    this.mouseX = mouseState.x;\n    this.mouseY = mouseState.y;\n  },\n\n  mouseDown(e) {\n    this.updateRaycastObjects();\n    const mouseState = this.getMouseState(e);\n    this.mouseX = mouseState.x;\n    this.mouseY = mouseState.y;\n    this.mouseXOrig = mouseState.x;\n    this.mouseYOrig = mouseState.y;\n  },\n\n  mouseUp(e) {\n    if (this.mouseX === this.mouseXOrig && this.mouseY === this.mouseYOrig) {\n      const pos = this.getTeleportPosition(this.mouseX, this.mouseY);\n\n      if (pos) {\n        this.teleportIndicator.position.copy(pos);\n        this.transition(pos);\n      }\n    }\n  },\n\n  easeInOutQuad(t) {\n    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;\n  },\n\n  tick(time, delta) {\n    if (!this.transitioning && !this.mobile) {\n      const pos = this.getTeleportPosition(this.mouseX, this.mouseY);\n\n      if (pos) {\n        this.teleportIndicator.position.copy(pos);\n      }\n    }\n\n    if (this.transitioning) {\n      this.transitionProgress += delta * this.data.transitionSpeed;\n      const easeInOutTransitionProgress = this.easeInOutQuad(this.transitionProgress);\n      const value = easeInOutTransitionProgress < 0.5 ? easeInOutTransitionProgress : 1.5 - 1 * (easeInOutTransitionProgress + 0.5);\n      this.teleportIndicator.scale.set(1 + value, 1, 1 + value); // set camera position\n\n      const camPos = this.camRig.position;\n      camPos.x = this.transitionCamPosStart.x + (this.transitionCamPosEnd.x - this.transitionCamPosStart.x) * easeInOutTransitionProgress;\n      camPos.y = this.transitionCamPosStart.y + (this.transitionCamPosEnd.y - this.transitionCamPosStart.y) * easeInOutTransitionProgress;\n      camPos.z = this.transitionCamPosStart.z + (this.transitionCamPosEnd.z - this.transitionCamPosStart.z) * easeInOutTransitionProgress;\n\n      if (this.transitionProgress >= 1) {\n        this.transitioning = false;\n        camPos.copy(this.transitionCamPosEnd);\n      }\n    }\n  }\n\n});\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

/******/ });
});