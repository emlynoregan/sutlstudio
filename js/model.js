/*globals sUTLevaluateDecl crapguid dataGetUser*/

/*eslint-env meteor, node*/

var gmodelTree = null;
var gselectedNode = null;


////////////// Observers
var _modelObservers = {};

var RegisterModelObserver = function(aId, aHandlerF)
{
	_modelObservers[aId] = aHandlerF;
};

var UnregisterModelObserver = function(aId)
{
	delete _modelObservers[aId];
};


////////////// Notify
var _doNotify = function (aNotifyObj)
{
	console.log("notify: " + JSON.stringify(aNotifyObj))
	_.map(_modelObservers, function(aObserverF){
		aObserverF(aNotifyObj);
	});
};

var NotifyLoaded = function()
{
	_doNotify({
		type: "loaded",
		tree: gmodelTree
	});
};

var NotifyTreeReplace = function()
{
	_doNotify({
		type: "treereplace",
		tree: gmodelTree
	});
};

var NotifyExpandNode = function(aNode)
{
	_doNotify({
		type: "expandnode",
		node: aNode
	});
};

var NotifyNodeSelected = function(aNode)
{
	_doNotify({
		type: "nodeselected",
		node: aNode
	});
};

var NotifyNodeUnselected = function(aNode)
{
	_doNotify({
		type: "nodeunselected",
		node: aNode
	});
};

var NotifyNodeExpanded = function(aNode)
{
	_doNotify({
		type: "nodeexpanded",
		node: aNode
	});
};

var NotifyNodeUpdated = function(aNode)
{
	_doNotify({
		type: "nodeupdated",
		node: aNode
	});
};

var NotifyNodeDeleted = function(aNodeId)
{
	_doNotify({
		type: "nodedeleted",
		nodeid: aNodeId
	});
};

var NotifyNodeAdded = function(aNode)
{
	_doNotify({
		type: "nodeadded",
		node: aNode
	});
};

var NotifyErrorMessage = function(aErrorMessage)
{
	_doNotify({
		type: "errormessage",
		errormessage: aErrorMessage
	});
};

////////////// Model manipulation
var _modelSetNode = function(aNode)
{
	gmodelTree = sUTLevaluateDecl({
		"newnode": aNode,
		"tree": gmodelTree
		},
		"setmodelnodebyid");
};

///////////////////////
/// external api
///////////////////////

var modelGetNodeById = function(aNodeId)
{
	return sUTLevaluateDecl({
		id: aNodeId,
		node: gmodelTree
	}, 
	"getmodelnodebyid");
};

var modelAddChildrenToModelNode = function(aModelNode, aChildList)
{
	var lnewModelNode = sUTLevaluateDecl({
			"node": aModelNode,
			"children": aChildList
		}, 
		"addchildrentomodelnode");

	_modelSetNode(lnewModelNode);
		
	NotifyNodeExpanded(lnewModelNode);
};

var modelReplaceNode = function(aNode)
{
	var lexistingNode = modelGetNodeById(aNode.id);
	
	if (!(lexistingNode && lexistingNode.state === "updated"))
	{
		_modelSetNode(aNode);
				
		NotifyNodeUpdated(aNode);
	}
};

var modelSetSelectedNode = function(aNodeId)
{
	var lnode = modelGetNodeById(aNodeId);
	
	gselectedNode = lnode;
	
	NotifyNodeSelected(lnode);
};

var modelUnselectNode = function(aNodeId)
{
	var lnode = modelGetNodeById(aNodeId);
	
	gselectedNode = lnode;
	
	NotifyNodeUnselected(lnode);
};

var modelInitialiseTree = function()
{
	gmodelTree = sUTLevaluateDecl(null, "constructroot");
	
	NotifyTreeReplace();
	
	modelSetSelectedNode("root");
};

var modelUpdateNode = function(aNodeId, aNodeDiff)
{
	var lnode = modelGetNodeById(aNodeId);
	
	if (lnode)
	{
		var lnewModelNode = sUTLevaluateDecl({
				"old": lnode,
				"diff": aNodeDiff
			},
			"applynewdiff"
		);
		
		_modelSetNode(lnewModelNode);
			
		NotifyNodeUpdated(lnewModelNode);
	}
};

var modelDeleteNode = function(aNodeId)
{
	var lnode = modelGetNodeById(aNodeId);
	
	if (lnode)
	{
		lnode.state = "deleted"; // do I need to mark all children "deleted" too?
			
		NotifyNodeDeleted(aNodeId);
	}
};

var _modelAddNode = function(aParentNodeId, aType)
{
	var lparentNode = modelGetNodeById(aParentNodeId);
	
	if (lparentNode)
	{
		var lnewNode = sUTLevaluateDecl({
			"item": {
				"name": "new" + aType,
				"id": crapguid(),
				"published": false
			}
		}, "construct" + aType);
		
		lnewNode.state = "added";

		var lnewParentNode = sUTLevaluateDecl({
				"node": lparentNode,
				"children": [lnewNode]
			}, 
			"addchildrentomodelnode");

		_modelSetNode(lnewParentNode);
			
		lnewNode = modelGetNodeById(lnewNode.id); // reload to get full info
		
		NotifyNodeAdded(lnewNode);
	}
};

var modelAddDistNode = function(aParentNodeId)
{
	_modelAddNode(aParentNodeId, "dist");
};

var modelAddDeclNode = function(aParentNodeId)
{
	_modelAddNode(aParentNodeId, "decl");
};

var modelMoveNode = function(aFromNodeId, aToParentNodeId, aToChildNodeId)
{
	var lfromNodeId = modelGetNodeById(aFromNodeId);
	var ltoParentNodeId = modelGetNodeById(aToParentNodeId);
	var ltoChildNodeId = modelGetNodeById(aToChildNodeId);
	
	if (lfromNodeId && ltoParentNodeId && !(ltoChildNodeId && ltoChildNodeId.parent !== lfromNodeId.id))
	{
		
		var lnewNode = sUTLevaluateDecl({
			"item": {
				"name": "new" + aType,
				"id": crapguid(),
				"published": false
			}
		}, "construct" + aType);
		
		lnewNode.state = "added";

		var lnewParentNode = sUTLevaluateDecl({
				"node": lparentNode,
				"children": [lnewNode]
			}, 
			"addchildrentomodelnode");

		_modelSetNode(lnewParentNode);
			
		lnewNode = modelGetNodeById(lnewNode.id); // reload to get full info
		
		NotifyNodeAdded(lnewNode);
	}
};

var modelGetUser = function(aHandler)
{
    dataGetUser(aHandler);	
}
