(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Création d'un module Angular
var app = angular.module("qcmApp", ["ngResource", "ngRoute", "ngCookies"]).
config(['$routeProvider', '$locationProvider', '$httpProvider', require("./../config/routing")]).
factory("config", require("./../config/configFactory")).
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
},{"./../config/configFactory":2,"./../config/routing":3,"./../services/rest":4}],2:[function(require,module,exports){
module.exports=function() {
	var factory={questions:{},server:{},reponses:{},questionnaire:{}};
	factory.activeBrewery=undefined;
	factory.questions.loaded=false;
	factory.questions.refresh="all";//all|ask
	factory.questions.update="immediate";//deffered|immediate
	factory.server.privateToken="";
	factory.server.restServerUrl="http://192.168.1.178/rest-qcm/";
	factory.server.force=false;
	return factory;
};
},{}],3:[function(require,module,exports){
module.exports=function($routeProvider,$locationProvider,$httpProvider) {
	$httpProvider.defaults.withCredentials = true;
	$routeProvider.
		when('/Questionnaires', {
			templateUrl: 'view/Questionnaire.html',
			controller: 'QuestionnairesController'
		}).
		when('/Connexion', {
			templateUrl: 'view/Connexion.html',
			controller: 'ConnexionController'
		}).
		when('/Inscription', {
			templateUrl: 'view/Inscription.html',
			controller: 'InscriptionController'
		}).
		when('/Questionnaire/:id', {
			templateUrl: 'view/Question.html',
			controller: 'QuestionsController'
		}).otherwise({
			redirectTo: '/Index.html'
		});
	if(window.history && window.history.pushState){
		$locationProvider.html5Mode(true);
	}
};
},{}],4:[function(require,module,exports){
module.exports=function($http,$resource,$location,restConfig,$sce) {
	var self=this;
	if(angular.isUndefined(this.messages))
		this.messages=new Array();
	
	this.getParams=function(){
		return '?token='+restConfig.server.privateToken+'&force='+restConfig.server.force;
	}
	this.headers={ 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
	    	'Accept': 'application/json'
	    	};
	this.getAll=function(response,what,callback,name){
		if(angular.isUndefined(name))
			name=what;
		var request = $http({
		    method: "GET",
		    url: restConfig.server.restServerUrl+what+this.getParams(),
		    headers: {'Accept': 'application/json'},
		    callback: 'JSON_CALLBACK'
		});
		request.success(function(data, status, headers, config) {
			response[name]=data;
			//restConfig[name].all=data;
			restConfig[name]=data;
			response.load=false;
			if(angular.isDefined(callback))
				callback(data);
		}).
		error(function(data, status, headers, config) {
			self.addMessage({type: "danger", content: "Erreur de connexion au serveur, statut de la réponse : "+status});
			console.log("Erreur de connexion au serveur, statut de la réponse : "+status);
		});
	};
	this.addMessage=function(message){
		content=$sce.trustAsHtml(message.content);
		self.messages.push({"type":message.type,"content":content});
	};
	
	this.post=function(response,what,name,callback){
		if(angular.isUndefined(callback))
			this.clearMessages();
		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
		$http.defaults.headers.post["Accept"] = "application/json";

		var request = $http({
		    method: "POST",
		    url: restConfig.server.restServerUrl+what+this.getParams(),
		    data: response.posted,
		    headers: self.headers
		});
		request.success(function(data, status, headers, config) {
			self.addMessage(data.message);
			if(angular.isUndefined(callback)){
				$location.path("/"+what);
			}else{
				callback();
			}
		}).error(function(data, status, headers, config){
			self.addMessage({type: "warning", content:"Erreur de connexion au serveur, statut de la réponse : "+status+"<br>"+data.message});
		});
	};
	
	/* --------------------- POST UTILISATEUR --------------------- */
	this.postUser=function(response,what,callback){
		var request = $http({
		    method: "POST",
		    url: restConfig.server.restServerUrl+what+this.getParams(),
		    data: $.param(response.posted),
		    headers: self.headers
		});
		request.success(function(data, status, headers, config) {
			if(angular.isUndefined(callback)){
				$location.path("/"+what);
			}else{
				callback(data);
			}
		}).error(function(data, status, headers, config){
			self.addMessage({type: "warning", content:"Erreur de connexion au serveur, statut de la réponse : "+status+"<br>"+data});
		});
	};
	/* ----------------------------------------------------------- */
	this.get=function(response,what,callback){
		var request = $http({
		    method: "GET",
		    url: restConfig.server.restServerUrl+what+this.getParams()
		});
		request.success(function(data, status, headers, config) {
			if(angular.isUndefined(callback)){
				$location.path("/"+what);
			}else{
				callback(data);
			}
		}).error(function(data, status, headers, config){
			self.addMessage({type: "warning", content:"Erreur de connexion au serveur, statut de la réponse : "+status+"<br>"+data});
		});
	};
	
	this.put=function(id,response,what,name,callback){
		if(angular.isUndefined(callback))
			this.clearMessages();
		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
		$http.defaults.headers.post["Accept"] = "text/plain";
		var request = $http({
		    method: "PUT",
		    url: restConfig.server.restServerUrl+what+'/'+id+this.getParams(),
		    data: response.posted,
		    headers: self.headers
		});
		request.success(function(data, status, headers, config) {
			self.addMessage(data.message);
			if(angular.isUndefined(callback)){
				$location.path("/"+what);
			}else{
				callback();
			}
		}).error(function(data, status, headers, config){
			self.addMessage({type: "warning", content: "Erreur de connexion au serveur, statut de la réponse : "+status+"<br>"+data.message});
		});
	};
	
	this.remove=function(object,what,callback){
		if(angular.isUndefined(callback))
			this.clearMessages();
		var request = $http({
		    method: "DELETE",
		    url: restConfig.server.restServerUrl+what+'/'+object.id+this.getParams(),
		    headers: self.headers
		});
		request.success(function(data, status, headers, config) {
			self.addMessage(data.message);
			if(angular.isDefined(callback)){
				callback();
			}
		}).error(function(data, status, headers, config){
			self.addMessage({type: "warning", content: "Erreur de connexion au serveur, statut de la réponse : "+status+"<br>"+data.message});
		});
	};
	
	this.clearMessages=function(){
		self.messages.length=0;
	};
};
},{}]},{},[1]);
