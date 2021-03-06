// Création d'un module Angular
var app = angular.module("qcmApp", ["ngResource", "ngRoute", "ngCookies"]).
config(['$routeProvider', '$locationProvider', '$httpProvider', require("./../config/routing")]).
factory("config", require("./../config/configFactory")).
service("user",["$scope","$cookieStore","rest", require("./../service/user")).
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

app.controller("InscriptionController", ["$scope","user",function($scope,user){
	user.insertUser($scope);
}]);

app.controller("ConnexionController", ["$scope","user",function($scope,user){
	$scope.User = {};
	var data = {posted: $scope.User};
	$scope.connectUser = function(){
		user.connect($scope);
	}
	
	$scope.disconnectUser = function(){
		user.disconnect($scope);
	}
	
	$scope.checkUser = function(){
		user.check($scope);
	}
}]);