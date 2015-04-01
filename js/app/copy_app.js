// Création d'un module Angular
var app = angular.module("qcmApp", ["ngResource", "ngRoute", "ngCookies"]).
config(['$routeProvider', '$locationProvider', '$httpProvider', require("./../config/routing")]).
factory("config", require("./../config/configFactory")).
service("config",["$http","$resource","$location","config","$sce", require("./../service/user")).
service("rest",["$http","$resource","$location","config","$sce", require("./../services/rest")]);

app.controller("QuestionsController", ["$scope","rest","$routeParams", function($scope,rest,$routeParams){
	$scope.idQuestionnaire=$routeParams.id;
	$scope.data={};
	$scope.data.questionnaire;
	rest.getAll($scope.data, "questionnaires/"+$scope.idQuestionnaire,undefined,"questionnaire");
	$scope.data.questions={};
	rest.getAll($scope.data, "questions/questionnaire/"+$scope.idQuestionnaire,function(questions){
		for(index in questions){
			rest.getAll(questions[index], "reponses/question/"+questions[index].id,undefined,"reponses");			
		}		
	},"questions");	
}]);

app.controller("QuestionnairesController", ["$scope","rest",function($scope,rest){
	$scope.data={};
	$scope.data.questionnaires;
	rest.getAll($scope.data, "questionnaires",undefined,"questionnaires");
}]);

app.controller("InscriptionController", ["$scope","rest",function($scope,rest){
	$scope.User = {};
	var data = {posted: $scope.User};
	$scope.addUser = function(){
		rest.postUser(data, "Users/add",function(result){
			console.log(result);
		});
	}
}]);

app.controller("ConnexionController", ["$cookieStore","$scope","rest",function($cookieStore,$scope,rest){
	$scope.User = {};
	var data = {posted: $scope.User};
	$scope.connectUser = function(){
		rest.postUser(data, "Users/connect", function(user){
			if(user.connected){
				console.log("Connecté");
				$cookieStore.put("user",user.token);
			}else{
				console.log("Non connecté");
			}
		});
	}
	
	$scope.disconnectUser = function(){
		$scope.value = {};
		rest.get($scope.value, "Users/disconnect", function(result){
			console.log(result);
			console.log($scope.value);
		});
	}
	
	$scope.checkUser = function(){
		$scope.value = {};
		rest.get($scope.value, "Users/check", function(result){
			console.log(result);
			console.log($scope.value);
		});
	}
}]);