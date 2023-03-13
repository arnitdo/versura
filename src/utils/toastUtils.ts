import {ReactNode, useCallback, useRef, useState} from 'react';
import {Toast} from "@elastic/eui/src/components/toast/global_toast_list";

type ToastType = "primary" | "success" | "warning" | "danger"

type ToastUtils = {
	toasts: Toast[]
	addToast: (toastTitle: string, toastText: string, toastType?: ToastType) => void,
	dismissToast: (dismissedToast: Toast) => void
}

type ToastListHookArgs = {
	toastIdFactoryFn: (toastType?: ToastType) => string
}

function useToastList(toastListArgs: ToastListHookArgs): ToastUtils{
	const [toasts, setToasts] = useState<Toast[]>([])
	
	const addToast = useCallback((toastTitle: string, toastText: string, toastType?: ToastType) => {
		const generatedToastId = toastListArgs.toastIdFactoryFn(toastType)
		setToasts((oldToasts) => {
			return [
				...oldToasts,
				{
					id: generatedToastId,
					title: toastTitle,
					text: toastText,
					color: toastType
				}
			]
		})
	}, [setToasts])
	
	const dismissToast = useCallback((dismissedToast: Toast) => {
		setToasts((oldToasts) => {
			return oldToasts.filter((currentToast) => {
				return currentToast.id !== dismissedToast.id
			})
		})
	}, [setToasts])
	
	return {toasts, addToast, dismissToast}
}

export {
	useToastList
}