module.exports=function($cookieStore,$scope,rest) {
	this.connect=function($scope){
		rest.postUser(data, "Users/connect", function(user){
			if(user.connected){
				console.log("Connecté");
				$cookieStore.put("user",user.token);
			}else{
				console.log("Non connecté");
			}
		});
	};
	
	this.disconnect=function(){
		$scope.value = {};
		rest.get($scope.value, "Users/disconnect", function(result){
			console.log(result);
			console.log($scope.value);
		});
	};
	
	this.check=function(){
		$scope.value = {};
		rest.get($scope.value, "Users/check", function(result){
			console.log(result);
			console.log($scope.value);
		});
	};
	
	this.updateUser=function(){
		
	};
	
	this.insertUser=function(){
		$scope.User = {};
		var data = {posted: $scope.User};
		$scope.addUser = function(){
			rest.postUser(data, "Users/add",function(result){
				console.log(result);
			});
		}
	};
};