THREE.WebGLPrograms = function ( renderer, capabilities ) {

	var programs = [];

	var shaderIDs = {
		MeshDepthMaterial: 'depth',
		MeshNormalMaterial: 'normal',
		MeshBasicMaterial: 'basic',
		MeshLambertMaterial: 'lambert',
		MeshPhongMaterial: 'phong',
		MeshStandardMaterial: 'standard',
		LineBasicMaterial: 'basic',
		LineDashedMaterial: 'dashed',
		PointsMaterial: 'points'
	};

	var parameterNames = [
		"precision", "supportsVertexTextures", "map", "envMap", "envMapMode",
		"lightMap", "aoMap", "emissiveMap", "bumpMap", "normalMap", "displacementMap", "specularMap",
		"roughnessMap", "metalnessMap",
		"alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp",
		"flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
		"maxBones", "useVertexTexture", "morphTargets", "morphNormals",
		"maxMorphTargets", "maxMorphNormals",
		"numDirLights", "numPointLights", "numSpotLights", "numHemiLights",
		"shadowMapEnabled", "pointLightShadows",
		"shadowMapType",
		"alphaTest", "doubleSided", "flipSided"
	];


	function allocateBones ( object ) {

		if ( capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture ) {

			return 1024;

		} else {

			// default for when object is not specified
			// ( for example when prebuilding shader to be used with multiple objects )
			//
			//  - leave some extra space for other uniforms
			//  - limit here is ANGLE's 254 max uniform vectors
			//    (up to 54 should be safe)

			var nVertexUniforms = capabilities.maxVertexUniforms;
			var nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );

			var maxBones = nVertexMatrices;

			if ( object !== undefined && object instanceof THREE.SkinnedMesh ) {

				maxBones = Math.min( object.skeleton.bones.length, maxBones );

				if ( maxBones < object.skeleton.bones.length ) {

					console.warn( 'WebGLRenderer: too many bones - ' + object.skeleton.bones.length + ', this GPU supports just ' + maxBones + ' (try OpenGL instead of ANGLE)' );

				}

			}

			return maxBones;

		}

	}

	this.getParameters = function ( material, lights, fog, object ) {

		var shaderID = shaderIDs[ material.type ];
		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		var maxBones = allocateBones( object );
		var precision = renderer.getPrecision();

		if ( material.precision !== null ) {

			precision = capabilities.getMaxPrecision( material.precision );

			if ( precision !== material.precision ) {

				console.warn( 'THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.' );

			}

		}

		var parameters = {

			shaderID: shaderID,

			precision: precision,
			supportsVertexTextures: capabilities.vertexTextures,

			map: !! material.map,
			envMap: !! material.envMap,
			envMapMode: material.envMap && material.envMap.mapping,
			lightMap: !! material.lightMap,
			aoMap: !! material.aoMap,
			emissiveMap: !! material.emissiveMap,
			bumpMap: !! material.bumpMap,
			normalMap: !! material.normalMap,
			displacementMap: !! material.displacementMap,
			roughnessMap: !! material.roughnessMap,
			metalnessMap: !! material.metalnessMap,
			specularMap: !! material.specularMap,
			alphaMap: !! material.alphaMap,

			combine: material.combine,

			vertexColors: material.vertexColors,

			fog: fog,
			useFog: material.fog,
			fogExp: fog instanceof THREE.FogExp2,

			flatShading: material.shading === THREE.FlatShading,

			sizeAttenuation: material.sizeAttenuation,
			logarithmicDepthBuffer: capabilities.logarithmicDepthBuffer,

			skinning: material.skinning,
			maxBones: maxBones,
			useVertexTexture: capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,

			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,
			maxMorphTargets: renderer.maxMorphTargets,
			maxMorphNormals: renderer.maxMorphNormals,

			numDirLights: lights.directional.length,
			numPointLights: lights.point.length,
			numSpotLights: lights.spot.length,
			numHemiLights: lights.hemi.length,

			pointLightShadows: lights.shadowsPointLight,

			shadowMapEnabled: renderer.shadowMap.enabled && object.receiveShadow && lights.shadows.length > 0,
			shadowMapType: renderer.shadowMap.type,

			alphaTest: material.alphaTest,
			doubleSided: material.side === THREE.DoubleSide,
			flipSided: material.side === THREE.BackSide

		};

		return parameters;

	};

	this.getProgramCode = function ( material, parameters ) {

		var chunks = [];

		if ( parameters.shaderID ) {

			chunks.push( parameters.shaderID );

		} else {

			chunks.push( material.fragmentShader );
			chunks.push( material.vertexShader );

		}

		if ( material.defines !== undefined ) {

			for ( var name in material.defines ) {

				chunks.push( name );
				chunks.push( material.defines[ name ] );

			}

		}

		for ( var i = 0; i < parameterNames.length; i ++ ) {

			var parameterName = parameterNames[ i ];
			chunks.push( parameterName );
			chunks.push( parameters[ parameterName ] );

		}

		return chunks.join();

	};

	this.acquireProgram = function ( material, parameters, code ) {

		var program;

		// Check if code has been already compiled
		for ( var p = 0, pl = programs.length; p < pl; p ++ ) {

			var programInfo = programs[ p ];

			if ( programInfo.code === code ) {

				program = programInfo;
				++ program.usedTimes;

				break;

			}

		}

		if ( program === undefined ) {

			program = new THREE.WebGLProgram( renderer, code, material, parameters );
			programs.push( program );

		}

		return program;

	};

	this.releaseProgram = function( program ) {

		if ( -- program.usedTimes === 0 ) {

			// Remove from unordered set
			var i = programs.indexOf( program );
			programs[ i ] = programs[ programs.length - 1 ];
			programs.pop();

			// Free WebGL resources
			program.destroy();

		}

	};

	// Exposed for resource monitoring & error feedback via renderer.info:
	this.programs = programs;

};
