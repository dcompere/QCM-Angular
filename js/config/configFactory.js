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