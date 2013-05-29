//var three = require("three");

var container, scene, camera, renderer, controls, stats;

//geometry 


init();

animate();

function init()
{
	var planes = {	P1:{ p1:{x:10, y:20, z:30}, p2:{x:40, y:-20, z:0}, p3:{x:20, y:20, z:20} },
			 P2:{ p1:{x:-3, y:45, z:23}, p2:{x:40, y:20, z:10}, p3:{x:40, y:50, z:-20} } };
	var lines = { L1:{ p1:{x:27, y:19, z:11}, p2:{x:5, y:-17, z:29} }, L2:{ p1:{x:-3, y:-43, z:23}, p2:{x:0, y:1, z:31} } };

	var pInt = {}; //plane intersecitons
	
	scene = new THREE.Scene();
	
	
	//some scene options
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = .1, FAR = 1000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.position.set(0,0,20);
	camera.lookAt(scene.position);
	
	scene.add(camera);


	//blindly assume has webgl available
	renderer = new THREE.WebGLRenderer( {antialias: true });
	renderer.setClearColorHex(0x000000,1);
	//renderer = new THREE.CanvasRenderer();
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	controls = new THREE.TrackballControls(camera);
	
	stats = new Stats();
	stats.domElement.style.position = "absolute";
	stats.domElement.style.bottom = "0px";
	stats.domElement.style.zIndex = 100;
	document.getElementById("canv").appendChild(renderer.domElement);
	document.getElementById("canv").appendChild(stats.domElement);


	//Plane Geometries, sort of
	var plane = {};

	for(var p in planes)
	{
		var squareToAdd = new THREE.Geometry();
		squareToAdd.vertices.push(new THREE.Vector3(planes[p].p1.x, planes[p].p1.y, planes[p].p1.z));
		squareToAdd.vertices.push(new THREE.Vector3(planes[p].p1.x + planes[p].p2.x, planes[p].p1.y + planes[p].p2.y, planes[p].p1.z + planes[p].p2.z));
		squareToAdd.vertices.push(new THREE.Vector3(planes[p].p1.x + planes[p].p2.x, planes[p].p1.y + planes[p].p3.y, planes[p].p1.z + planes[p].p3.z));
		squareToAdd.vertices.push(new THREE.Vector3(planes[p].p1.x + planes[p].p2.x + planes[p].p3.x, planes[p].p1.y + planes[p].p2.y + planes[p].p3.y, planes[p].p1.z + planes[p].p2.z + planes[p].p3.z));
		squareToAdd.faces.push(new THREE.Face4(0,2,3,1));
		var squareColor = new THREE.MeshBasicMaterial({color:0xFF0000, side:THREE.DoubleSide});
		var squareMesh = new THREE.Mesh(squareToAdd, squareColor);
		squareMesh.position.set(planes[p].p1.x, planes[p].p1.y, planes[p].p1.z);
		scene.add(squareMesh);
	}

	for(var l in lines)
	{
		var lineToAdd = new THREE.Geometry();
		lineToAdd.vertices.push(new THREE.Vector3(lines[l].p1.x, lines[l].p1.y, lines[l].p1.z));
		lineToAdd.vertices.push(new THREE.Vector3(lines[l].p2.x, lines[l].p2.y, lines[l].p2.z));
		var lineColor = new THREE.LineBasicMaterial({color:0x4B3CF0, opacity:.5});
		var line = new THREE.Line(lineToAdd, lineColor);
		scene.add(line);
	}
	
	//get plane-line intersection
	var pointGeometry = new THREE.Geometry();
	for(var p in planes)
	{
		console.log("-----------------------newplane---------------------------------------");
		for(var l in lines)
		{
			console.log("------------------new line in " + p );
			var pmat = new THREE.Matrix3( lines[l].p1.x - lines[l].p2.x, planes[p].p2.x - planes[p].p1.x, planes[p].p3.x - planes[p].p1.x,
							lines[l].p1.y - lines[l].p2.y, planes[p].p2.y - planes[p].p1.y, planes[p].p3.y - planes[p].p1.y,
							lines[l].p1.z - lines[l].p2.z, planes[p].p2.z - planes[p].p1.z, planes[p].p3.z - planes[p].p1.z );
			
			console.log(pmat.elements[0] + " " + pmat.elements[1] + " " + pmat.elements[2] + "\n" +
					pmat.elements[3] + " " + pmat.elements[4] + " " + pmat.elements[5] + "\n" + 
					pmat.elements[6] + " " + pmat.elements[7] + " " + pmat.elements[8]);
			
			var pvec = new THREE.Vector3(lines[l].p1.x - planes[p].p1.x, lines[l].p1.y - planes[p].p1.y, lines[l].p1.z - planes[p].p1.z);
			console.log("pvec x: " + pvec.x + " y: " + pvec.y + " z: " + pvec.z);
			
			//i think i fucked up the pmat indeces... transpose this bitch then
			//var invpmat = inverse3(pmat);
			var pel = pmat.elements;
			var invpmat = inverse3(new THREE.Matrix3(pel[0], pel[3], pel[6],
								pel[1], pel[4], pel[7],
								pel[2], pel[5],	pel[8]));
			var paramVec = pvec.applyMatrix3(invpmat);
			console.log("paramvec x: " + paramVec.x + " y: " + paramVec.y + " z: " + paramVec.z);

			var pointToAdd = new THREE.Vector3();
			var t = paramVec.x;
			
			console.log("t: " + t);
	
			pointToAdd.x = lines[l].p1.x - (lines[l].p2.x - lines[l].p1.x)*t;
			pointToAdd.y = lines[l].p1.y - (lines[l].p2.y - lines[l].p1.y)*t;
			pointToAdd.z = lines[l].p1.z - (lines[l].p2.z - lines[l].p1.z)*t;
			pointGeometry.vertices.push(pointToAdd);
			console.log("x: " + pointToAdd.x + " y: " + pointToAdd.y + " z: " + pointToAdd.z);
			//scene.add(pointToAdd);
		}
	}
	var particles = new THREE.ParticleSystem(pointGeometry, new THREE.ParticleBasicMaterial({color:0x0000FF, size:10}));
	scene.add(particles);
	

}

function inverse3(matrix)
{
	var mel = matrix.elements;
	var invMatrix = new THREE.Matrix3( (mel[4]*mel[8])-(mel[7]*mel[5]), (mel[6]*mel[5])-(mel[3]*mel[8]), (mel[3]*mel[7])-(mel[6]*mel[4]),
						(mel[7]*mel[2])-(mel[1]*mel[8]), (mel[0]*mel[8])-(mel[6]*mel[2]), (mel[6]*mel[1])-(mel[0]*mel[7]),
						(mel[1]*mel[5])-(mel[4]*mel[5]), (mel[3]*mel[2])-(mel[0]*mel[5]), (mel[0]*mel[4])-(mel[3]*mel[1]) );
	invMatrix.multiplyScalar(1 / matrix.determinant());
	var imel = invMatrix.elements;
	console.log("det: " + matrix.determinant());

	console.log(imel[0] + " " + imel[3] + " " + imel[6] + "\n" + 
			imel[1] + " " + imel[4] + " " + imel[7] + "\n" +
			imel[2] + " " + imel[5] + " " + imel[8] );
	
	
	/*
	var fuckTHREEtohell = new THREE.Matrix3(imel[0], imel[1], imel[2],
						imel[3], imel[4], imel[5],
						imel[6], imel[7], imel[8]);
	return fuckTHREEtohell;
	*/
	return invMatrix;
}

function normalizeVector3(vec)
{
	var rvec = new THREE.Vector3(vec.x, vec.y, vec.z);
	rvec.normalize();
	return rvec;
}

function animate()
{
	requestAnimationFrame(animate);
	renderScene();
	update();
}

function update()
{
	controls.update();
	stats.update();
}

function renderScene()
{
	renderer.render(scene,camera);
}
