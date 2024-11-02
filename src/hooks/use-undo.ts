import { useCallback, useState } from "react";

export function useUndo<T>(initialState: T) {
	const [state, setstate] = useState<T>(initialState);
	const [undoStack, setUndoStack] = useState<T[]>([]);
	const [redoStack, setRedoStack] = useState<T[]>([]);

	const setState = useCallback(
		(newState: T) => {
			setUndoStack((prevStack) => [...prevStack, state]);
			setstate(newState);
			setRedoStack([]);
		},
		[state],
	);

	const undo = useCallback(() => {
		if (undoStack.length === 0) return;
		const prevState = undoStack[undoStack.length - 1];
		setRedoStack((prevStack) => [...prevStack, state]);
		setstate(prevState as T);
		setUndoStack((prevStack) => prevStack.slice(0, -1));
	}, [state, undoStack]);

	const redo = useCallback(() => {
		if (redoStack.length === 0) return;
		const nextState = redoStack[redoStack.length - 1];
		setUndoStack((prevStack) => [...prevStack, state]);
		setstate(nextState as T);
		setRedoStack((prevStack) => prevStack.slice(0, -1));
	}, [state, redoStack]);

	return {
		state,
		setState,
		undo,
		redo,
		canUndo: undoStack.length > 0,
		canRedo: redoStack.length > 0,
	};
}
