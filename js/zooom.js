(function () {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;

    var container,stats;

    var camera, scene, renderer;

    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var triangles;

    var pointCloud = [];
    var pcl = [];

    var numVertices =1000;
    var w = 598/2;
    var h = 362/2;
    var vertices = [];
    var colors = [];
    var meshes = [];
    var blob;
    var dirs = [];
    var texture1;
    var material1;
    var controls;
    var sphereObj;
    var timePassed = 0;
    var blobChildren = [];
    var first = true;
    var raycaster= new THREE.Raycaster();

    var INTERSECTED;

    window.onresize = function () {
			SCREEN_WIDTH = window.innerWidth;
			SCREEN_HEIGHT = window.innerHeight;
			camera = new THREE.PerspectiveCamera( 35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 25000 );
        camera.position.z = 200;
			renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		};

    var objs = [];
    var pusher1 = {pos:new THREE.Vector3(-22, -22, 0), force:30000.0, lastJumpTime:0.0, changeInterval:Math.random()*2000.0+500};
    var pusher2 = {pos:new THREE.Vector3(40.0, -30.0, 55.0), force:30000.0, lastJumpTime:0.0, changeInterval:Math.random()*2000.0+500};
    var pusher3 = {pos:new THREE.Vector3(0, 0, -15.0), force:15000.0, lastJumpTime:0.0, changeInterval:Math.random()*2000.0+500};
    var pusher4 = {pos:new THREE.Vector3(0, 0, -15.0), force:15000.0, lastJumpTime:0.0, changeInterval:Math.random()*2000.0+500};
    var pusher5 = {pos:new THREE.Vector3(0, 0, -15.0), force:15000.0, lastJumpTime:0.0, changeInterval:Math.random()*2000.0+500};

   var pushers = [pusher1, pusher2, pusher3, pusher4, pusher5];

    var cubey;

    var particleSystem;
    var verts;

    function cubeSystem(pos, size, num, parent) {
        // create the particle variables
        var particleCount = 2500,
            particles = new THREE.Geometry(),
        // create the particle variables
            pMaterial = new THREE.PointCloudMaterial({
            color: Math.floor(Math.random()*0xFFFFFF),
            size: 15,
            map: THREE.ImageUtils.loadTexture(
                "img/particle.png"
            ),
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        pMaterial.depthWrite = false;

// also update the particle system to
// sort the particles which enables
// the behaviour we want

        // now create the individual particles
        for (var p = 0; p < particleCount; p++) {


            // create a particle with random
            // position values, -250 -> 250
            var pX = Math.random() * 100 - 50,
                pY = Math.random() * 100 - 50,
                pZ = Math.random() * 100 - 50,
                particle =
                    new THREE.Vector3(pX, pY, pZ)
                ;

            particle.cust_pos = new THREE.Vector3(pX, pY, pZ);
            particle.cust_spring = {force:0.008};
            particle.cust_dir = new THREE.Vector3();

            particles.colors.push(new THREE.Color(Math.floor(Math.random()*0xFFFFFF)));
            // add it to the geometry
            particles.vertices.push(particle);
        }

// create the particle system
        particleSystem = new THREE.PointCloud(
            particles,
            pMaterial);

        particleSystem.color1 = new THREE.Color(Math.floor(Math.random()*0xFFFFFF));
        particleSystem.color2 = new THREE.Color(Math.floor(Math.random()*0xFFFFFF));
       // console.log(particleSystem.color1, particleSystem.color2);
        particleSystem.sortParticles = true;

        verts = particles.vertices;

// add it to the scene
        parent.add(particleSystem);
    }

    var colors = [];
    var light, light2;
    function init() {
        var spMat = new THREE.MeshBasicMaterial( { color: 0x100afa } );
        var spMat2 = new THREE.MeshPhongMaterial({
            // light
            specular: '#1001aa',
            // intermediate
            color: '#1001ff',
            // dark
            emissive: '#006063',
            shininess: 5
        });
        for (var i = 3; i--;) {
            colors.push(Math.floor(Math.random()*0xFFFFFF));
        }

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        raycaster = new THREE.Raycaster();

        renderer = new THREE.WebGLRenderer( { antialias: true } );

        camera = new THREE.PerspectiveCamera( 35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 25000 );
        camera.position.z = 200;

        scene = new THREE.Scene();


        cubeSystem(new THREE.Vector3(0, 0, 0), 60, 24, scene);



        //scene.add(sphereObj);

        light2 = new THREE.DirectionalLight( 0x222222, 2 );
        light2.position.set( 10, 1, 15 );
        scene.add( light2 );

        light = new THREE.DirectionalLight( 0x222222, 2 );
        light.position.set( 1, 1, 1 );
        scene.add( light );

        var ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);
        //scene.add()


        // RENDERER
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        renderer.setClearColor( 0x000000, 1 );
        renderer.autoClear = false;

        renderer.domElement.style.position = "relative";
        container.appendChild( renderer.domElement );

        controls = new THREE.OrbitControls( camera, renderer.domElement );

        // STATS1
        stats = new Stats();
        container.appendChild( stats.domElement );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );

        lastTime = new Date().getTime();
    }

    var mouse = new THREE.Vector2();

    function onDocumentMouseMove(event) {

        event.preventDefault();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    }

    function makeSmaller() {
        if (false) {
            //INTERSECTED.material = null;
            var v = new THREE.Vector3(INTERSECTED.cust_pos.x + INTERSECTED.cust_size / 4,
                    INTERSECTED.cust_pos.y + INTERSECTED.cust_size / 4,
                    INTERSECTED.cust_pos.z + INTERSECTED.cust_size / 4);
            partitionCube(v, INTERSECTED.cust_size, 2, scene);
            scene.remove(INTERSECTED);
        }
        //INTERSECTED.geometry = null;
    }

    var toggleGrav = true;

    function jumpPusher(pusher) {
        pusher.pos.x = Math.random() * 100 - 50;
        pusher.pos.y = Math.random() * 100 - 50;
        pusher.pos.z = Math.random() * 100 - 50;
        pusher.force = (Math.random() * 100000.0 - 50000);
    }

    function onMouseDown( event ) {
        makeSmaller();
        uuu = 0.0;
        //toggleGrav = !toggleGrav;
        //jumpPusher(pushers[0]);
        particleSystem.color1 = new THREE.Color(Math.floor(Math.random()*0xFFFFFF));
        particleSystem.color2 = new THREE.Color(Math.floor(Math.random()*0xFFFFFF));
    }

var lastJumpTime = 0;
var lastColorTime = 0;
var uuu = 0;
    function animate() {
        for (var q = pushers.length; q--;) {
            var pusher = pushers[q];
            var thisTime = new Date().getTime();
            var deltaTime = thisTime - lastTime;
            timePassed += deltaTime;
            delta += 0.1;
            if (timePassed - pusher.lastJumpTime > pusher.changeInterval) {
                jumpPusher(pusher);
                pusher.lastJumpTime = timePassed;
            }
            if (timePassed - pusher.lastJumpTime > 3000) {
                //pusher.force = 0;
            }
            var changeColors = false;
            if (timePassed - lastColorTime > 15000) {
                changeColors = true;
                lastColorTime = timePassed;
                colors = [];
                for (var i = 3; i--;) {
                    colors.push(Math.floor(Math.random() * 0xFFFFFF));
                }
            }
            for (var b = verts.length; b--;) {
                var obj = verts[b];
                scene.updateMatrixWorld();

                if (changeColors) {
                    //obj.material.emissive.setHex(colors[Math.floor(Math.random()*colors.length)]);
                }

                var vector = obj;
                //vector.setFromMatrixPosition( obj.matrixWorld );

                //pusher.pos.x += 0.02;
                //pusher.pos.y += 0.02;

                if (pusher.pos.x > 22) {
                    pusher.pos.x = Math.random() * -88.0 + 44.0;
                    pusher.pos.y = Math.random() * -88.0 + 44.0;
                }

                var root = obj.cust_pos;

                var distVec = new THREE.Vector3(vector.x - pusher.pos.x, vector.y - pusher.pos.y, vector.z - pusher.pos.z);
                var distRoot = new THREE.Vector3(root.x - vector.x, root.y - vector.y, root.z - vector.z);
                var dist2 = distVec.x * distVec.x + distVec.y * distVec.y + distVec.z * distVec.z;
                var dist3 = distRoot.x * distRoot.x + distRoot.y * distRoot.y + distRoot.z * distRoot.z;
                if (dist2 <= 600) dist2 = 600;
                //if (dist3 <= 1) dist3 = 1;
                var force1 = pusher.force /** (Math.sin(delta)+1)*/ / dist2;
                if (!toggleGrav) {
                    force1 = 0.0;
                }
                var force2 = obj.cust_spring.force * dist3;
                var force = (force2 - force1) / 1000.0 * deltaTime;

                distRoot.normalize().multiplyScalar(force2 / 1000.0 * deltaTime);
                distVec.normalize().multiplyScalar(force1 / 1000.0 * deltaTime);

                //if (b==10)console.log(force1, force2);
                // var dist = Math.sqrt(dist2);
                // console.log(force);

                obj.cust_dir = new THREE.Vector3(obj.cust_dir.x + distVec.x + distRoot.x,
                        obj.cust_dir.y + distVec.y + distRoot.y, obj.cust_dir.z + distVec.z + distRoot.z);

                obj.cust_dir.multiplyScalar(0.9);

                uuu = Math.max(uuu, obj.cust_dir.length());

                particleSystem.geometry.colors[b] = particleSystem.color1.lerp(particleSystem.color2, obj.cust_dir.length()/5.0);

                //cube.cust_dir = new THREE.Vector3();

                obj.x += obj.cust_dir.x;
                obj.y += obj.cust_dir.y;
                obj.z += obj.cust_dir.z;
            }
        }
        particleSystem.geometry.colorsNeedUpdate = true;
        particleSystem.geometry.verticesNeedUpdate = true;

        /*
conole
            */
//console.log(uuu);

        requestAnimationFrame( animate );

        render();
        controls.update();
        stats.update();
        lastTime = thisTime;
    }

    var timeNewLookAt = 0;
    var nextUpdate = 0;
    var lookAt = new THREE.Vector3(0,0,0);
    var newLookAt = new THREE.Vector3(0,0,0);
    var oldLookAt = new THREE.Vector3(0,0,0);
    var lookAtDist = new THREE.Vector3(0,0,0);
    var theta = 45;
    var radius = 80;
    var radius2 = 100;
    var beta = 33;
    var gamma = 33;
    var delta = 33;
    function render() {

        camera.position.x = 0;//+= ( mouseX - camera.position.x ) * .05;
        camera.position.y = -200;// THREE.Math.clamp( camera.position.y + ( - ( mouseY - 200 ) - camera.position.y ) * .05, 50, 1000 );
        camera.position.z = 200;

        theta += 2.5;
        beta += 0.5;
        gamma -= 0.8;

        camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
        camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
        camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );

        var x = radius2 * Math.sin( THREE.Math.degToRad( beta ) );
        var y = radius2 * Math.sin( THREE.Math.degToRad( beta ) );
        var z = radius2 * Math.cos( THREE.Math.degToRad( beta ) );

        light.position.set(x,y,z);

        var x = radius2 * Math.sin( THREE.Math.degToRad( gamma ) );
        var y = radius2 * Math.sin( THREE.Math.degToRad( gamma ) );
        var z = radius2 * Math.cos( THREE.Math.degToRad( gamma ) );

        light2.position.set(x,y,z);

        var tp = timePassed - timeNewLookAt;
        if (tp < 1000) {
            var x = (oldLookAt.x) + lookAtDist.x * (tp / 1000);
            var y = (oldLookAt.y) + lookAtDist.y * (tp / 1000);
            var z = (oldLookAt.z) + lookAtDist.z * (tp / 1000);

            //lookAt = new THREE.Vector3(x,y,z);
        }
       // lookAt = new THREE.Vector3(mouse.x*50, mouse.y*50, 0);
        camera.lookAt( lookAt );

        //radius = 30+100*Math.pow(0.99999, timePassed);
        //camera.fov = 35*Math.pow(0.9998, timePassed);
        camera.fov = 35;
        camera.updateProjectionMatrix ();

        renderer.enableScissorTest( false );
        renderer.clear();
        renderer.enableScissorTest( true );

        renderer.setScissor( 0, 0, SCREEN_WIDTH - 2, SCREEN_HEIGHT );

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( scene.children );

        if ( intersects.length > 0 ) {
            var obj = intersects[ 0 ].object;
            scene.updateMatrixWorld();

            var vector = new THREE.Vector3();
            vector.setFromMatrixPosition( obj.matrixWorld );
            newLookAt = vector;
            oldLookAt = new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z);
            timeNewLookAt = timePassed;

            lookAtDist = new THREE.Vector3(newLookAt.x-lookAt.x,newLookAt.y-lookAt.y,newLookAt.z-lookAt.z);
            if ( false && INTERSECTED != intersects[ 0 ].object ) {

               if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );


                INTERSECTED = intersects[ 0 ].object;
                makeSmaller();
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 );
                //INTERSECTED.material.emissive.setHex( Math.floor(Math.random()*0xFFFFFF) );

            }

        } else {
           // newLookAt = new THREE.Vector3(0,0,0);
          //  oldLookAt = new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z);
           // lookAtDist = new THREE.Vector3(newLookAt.x-lookAt.x,newLookAt.y-lookAt.y,newLookAt.z-lookAt.z);
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = null;

        }

        renderer.render( scene, camera );

    }

    function update() {
        controls.update();
    }

    document.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    }, false);
    document.addEventListener("DOMContentLoaded", function(event) {
        init();
        animate();
    });
})();