/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Cursor Teleport component for A-Frame.
 */
AFRAME.registerComponent('cursor-teleport', {
  schema: {
    cameraHead: { type: 'string', default: '' },
    cameraRig: { type: 'string', default: '' },
    collisionEntities: { type: 'string', default: '' },
    ignoreEntities: { type: 'string', default: '' },
    landingMaxAngle: { default: '45', min: 0, max: 360 },
    landingNormal: { type: 'vec3', default: '0 1 0' }
  },
  init: function () {

    console.log( "Fixed self" );

    teleporter = this;

    // platform detect
    teleporter.mobile = AFRAME.utils.device.isMobile();

    // main app
    teleporter.scene = this.el.sceneEl;
    teleporter.canvas = teleporter.scene.renderer.domElement;

    // camera
    document.querySelector(this.data.cameraHead).object3D.traverse(function (child) {
      if (child instanceof THREE.Camera) {
        teleporter.cam = child;
      }
    });

    teleporter.camPos = new THREE.Vector3();
    teleporter.camRig = document.querySelector(this.data.cameraRig).object3D;
    teleporter.camPos = teleporter.camRig.position;

    //collision
    teleporter.rayCaster = new THREE.Raycaster();
    teleporter.referenceNormal = new THREE.Vector3();
    teleporter.rayCastObjects = [];

    // Update collision normal
    teleporter.referenceNormal.copy(this.data.landingNormal);

    // RING teleport indicator - original
    var geo = new THREE.RingGeometry(.25, .3, 32, 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, .02, 0);
    var mat = new THREE.MeshBasicMaterial( { color: 0x774DEE } );
    var indicatorRing = new THREE.Mesh(geo, mat);

    // CYLINDER teleport indicator
    var geoCyl = new THREE.CylinderGeometry(.3, .3, .5, 32, 1, true);
    geoCyl.translate(0, .25, 0);
    // texture source MIT license https://github.com/fernandojsg/aframe-teleport-controls/blob/master/lib/cylinderTexture.js
    var textureString = 'data:image/png;base64,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';
    const textureCyl = new THREE.TextureLoader().load( textureString );    
    var matCyl = new THREE.MeshBasicMaterial( { color: 0x774DEE, side: 'double', map: textureCyl, transparent: true, depthTest: false} );
    var indicatorCyl = new THREE.Mesh(geoCyl, matCyl);

    const group = new THREE.Group();
    group.add( indicatorRing );
    group.add( indicatorCyl );

    teleporter.teleportIndicator = group;

    teleporter.scene.object3D.add(teleporter.teleportIndicator);


    // transition
    teleporter.transitioning = false;
    teleporter.transitionProgress = 0;
    teleporter.transitionSpeed = .01;
    teleporter.transitionCamPosStart = new THREE.Vector3();
    teleporter.transitionCamPosEnd = new THREE.Vector3();

    teleporter.updateRaycastObjects = function () {

      // updates the array of meshes we will need to raycast to

      // clear the array of any existing meshes
      teleporter.rayCastObjects = [];

      if (this.data.collisionEntities != '') {
        // traverse collision entities and add their meshes to the rayCastEntities array.
        var collisionEntities = teleporter.scene.querySelectorAll(this.data.collisionEntities);

        collisionEntities.forEach(e => {
          e.object3D.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              // mark this mesh as a collision object
              child.userData.collision = true;
              teleporter.rayCastObjects.push(child);
            }
          });
        });
      } else {
        // if no collision entities are specified, create a default ground plane collision.
        var geo = new THREE.PlaneGeometry(500, 500, 1);
        geo.rotateX(-Math.PI / 2);
        var mat = new THREE.MeshNormalMaterial();
        var collisionMesh = new THREE.Mesh(geo, mat);
        // mark this mesh as a collision object
        collisionMesh.userData.collision = true;
        teleporter.rayCastObjects.push(collisionMesh);
      }

      // We may need some entities to be seen by the raycaster even though they are not teleportable.
      // This prevents the user from unnesserily teleporting when clicking things like buttons or UI.
      
      if(this.data.ignoreEntities != '') {
        var ignoreEntities = teleporter.scene.querySelectorAll(this.data.ignoreEntities);
        ignoreEntities.forEach(e => {
          e.object3D.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              teleporter.rayCastObjects.push(child);
            }
          });
        });
      }
    }

    function getMouseState(canvas, e) {
      var rect = canvas.getBoundingClientRect();
      if (e.clientX != null) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      } else if (e.touches[0] != null) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        }
      }
    }

    teleporter.getTeleportPosition = function (mouse_x, mouse_y) {

      if (teleporter.rayCastObjects.length != 0) {
        if (teleporter.hasOwnProperty('cam') && teleporter.hasOwnProperty('canvas')) {
          var cam = teleporter.cam;
          var rect = teleporter.canvas.getBoundingClientRect();
          var mouse = new THREE.Vector2();

          mouse.x = (mouse_x / (rect.right - rect.left)) * 2 - 1;
          mouse.y = -(mouse_y / (rect.bottom - rect.top)) * 2 + 1;

          teleporter.rayCaster.setFromCamera(mouse, cam);
          var intersects = teleporter.rayCaster.intersectObjects(teleporter.rayCastObjects);

          if (intersects.length != 0 && teleporter.isValidNormalsAngle(intersects[0].face.normal)) {
            if (intersects[0].object.userData.collision == true) {
              return intersects[0].point;
            }
            return false
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        return false
      }
    }

    teleporter.isValidNormalsAngle = function (collisionNormal) {
      var angleNormals = teleporter.referenceNormal.angleTo(collisionNormal);
      return (THREE.Math.RAD2DEG * angleNormals <= this.data.landingMaxAngle);
    }

    teleporter.transition = function (destPos) {
      teleporter.transitionProgress = 0;

      teleporter.transitionCamPosEnd.x = destPos.x;
      teleporter.transitionCamPosEnd.y = destPos.y;
      teleporter.transitionCamPosEnd.z = destPos.z;

      teleporter.transitionCamPosStart.x = teleporter.camPos.x;
      teleporter.transitionCamPosStart.y = teleporter.camPos.y;
      teleporter.transitionCamPosStart.z = teleporter.camPos.z;

      teleporter.transitioning = true;
    }

    function mouseMove(e) {
      var mouseState = getMouseState(teleporter.canvas, e);

      teleporter.mouseX = mouseState.x;
      teleporter.mouseY = mouseState.y;

    }

    function mouseDown(e) {
      teleporter.updateRaycastObjects();

      var mouseState = getMouseState(teleporter.canvas, e);
      teleporter.mouseX = mouseState.x;
      teleporter.mouseY = mouseState.y;

      teleporter.mouseXOrig = mouseState.x;
      teleporter.mouseYOrig = mouseState.y;

    }

    function mouseUp(e) {
      if (teleporter.mouseX == teleporter.mouseXOrig && teleporter.mouseY == teleporter.mouseYOrig) {
        var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);
        if (pos) {
          teleporter.teleportIndicator.position.x = pos.x;
          teleporter.teleportIndicator.position.y = pos.y;
          teleporter.teleportIndicator.position.z = pos.z;
          teleporter.transition(pos);
        }
      }
    }

    teleporter.updateRaycastObjects();

    // event listeners
    teleporter.canvas.addEventListener('mousedown', mouseDown, false);
    teleporter.canvas.addEventListener('mousemove', mouseMove, false);
    teleporter.canvas.addEventListener('mouseup', mouseUp, false);
    teleporter.canvas.addEventListener('touchstart', mouseDown, false);
    teleporter.canvas.addEventListener('touchmove', mouseMove, false);
    teleporter.canvas.addEventListener('touchend', mouseUp, false);

    // helper functions
    teleporter.easeInOutQuad = function (t) {
      return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  },
  tick: function () {
    if (!teleporter.transitioning && !teleporter.mobile) {
      var pos = teleporter.getTeleportPosition(teleporter.mouseX, teleporter.mouseY);
      if (!teleporter.mobile && pos) {
        teleporter.teleportIndicator.position.x = pos.x;
        teleporter.teleportIndicator.position.y = pos.y;
        teleporter.teleportIndicator.position.z = pos.z;
      }
    }
    if (teleporter.transitioning) {
      teleporter.transitionProgress += teleporter.transitionSpeed;

      // set camera position
      teleporter.camPos.x = teleporter.transitionCamPosStart.x + ((teleporter.transitionCamPosEnd.x - teleporter.transitionCamPosStart.x) * teleporter.easeInOutQuad(teleporter.transitionProgress));
      teleporter.camPos.y = teleporter.transitionCamPosStart.y + ((teleporter.transitionCamPosEnd.y - teleporter.transitionCamPosStart.y) * teleporter.easeInOutQuad(teleporter.transitionProgress));
      teleporter.camPos.z = teleporter.transitionCamPosStart.z + ((teleporter.transitionCamPosEnd.z - teleporter.transitionCamPosStart.z) * teleporter.easeInOutQuad(teleporter.transitionProgress));

      if (teleporter.transitionProgress >= 1) {
        teleporter.transitioning = false;
      }
    }
  }
});
