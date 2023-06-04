import React, {useEffect, useState} from 'react'
import './GenericYesNoPopup.scss'
import {TextButton} from '../../Common/TextButton/TextButton';
import {ContextManager} from '../../../logic/context/ContextManager';
import {ContextType} from '../../../data/enums/ContextType';

interface IProps {
    title: string;
    renderContent: () => any;
    acceptLabel?: string;
    onAccept?: () => any;
    skipAcceptButton?: boolean;
    disableAcceptButton?: boolean;
    rejectLabel?: string;
    onReject?: () => any;
    skipRejectButton?: boolean;
    disableRejectButton?: boolean;
    hasCancelButton?: boolean
    cancelButtonHandler?: () => any;
}

export const GenericYesNoPopup: React.FC<IProps> = (
    {
        title,
        renderContent,
        acceptLabel,
        onAccept,
        skipAcceptButton,
        disableAcceptButton,
        rejectLabel,
        onReject,
        skipRejectButton,
        disableRejectButton,
        cancelButtonHandler,
        hasCancelButton
    }) => {

    const [status, setMountStatus] = useState(false);
    useEffect(() => {
        if (!status) {
            ContextManager.switchCtx(ContextType.POPUP);
            setMountStatus(true);
        }
    }, [status]);

    const onClickCancelButton = () => {
        cancelButtonHandler()
    }

    return (
        <div className='GenericYesNoPopup'>
            <div className='Header'>
                <div className='Text'>
                {title}
                </div>
                {hasCancelButton && <button className='TextButton' onClick={onClickCancelButton}>X</button>}
            </div>
            <div className='Content'>
                {renderContent()}
            </div>
            <div className='Footer'>
                {!skipRejectButton && <TextButton
                    label={rejectLabel ? rejectLabel : 'NO, THANKS'}
                    onClick={onReject}
                    externalClassName={'reject'}
                    isDisabled={disableRejectButton}
                />}
                {!skipAcceptButton && <TextButton
                    label={acceptLabel ? acceptLabel : 'YES'}
                    onClick={onAccept}
                    externalClassName={'accept'}
                    isDisabled={disableAcceptButton}
                />}
            </div>
        </div>
    )
};
