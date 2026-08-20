class_name TaskResolutionSystem
extends RefCounted

func resolve(dispatch_instance: DispatchInstance) -> ResultInstance:
	var result = ResultInstance.new()
	result.dispatch_id = dispatch_instance.dispatch_instance_id
	return result
