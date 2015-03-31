module.exports=function(rest,config,$route){
	var self=this;
	this.dataScope={};
	this.operations=[];
	
	this.init=function(data){
		self.dataScope=data;
	};
	
	this.addOperation=function(type,operation,object){
		object.flag=type;
		self.operations.push({'type': type,'op': operation,'object': object});
	};
	
	this.execute=function(index){
		var callback;
		if(index+1<self.operations.length){
			callback=function(){
				self.operations.splice(index,1);
				self.execute(index);
			};
		}else{
			callback=function(){
				self.operations.length=0;
				config.breweries.loaded=false;
				$route.reload();
			};
		}
		var operation=self.operations[index];
		operation.op(operation.object,true,callback);
	};
	
	this.executeAll=function(){
		rest.clearMessages();
		if(self.operations.length>0){
			self.execute(0);
		}else{
			config.breweries.loaded=false;
			$route.reload();
		}
	}
};