import React from 'react';
import styled from 'styled-components';

const P = styled.p `
    margin-top: 0px;
    margin-bottom: 0px;
    margin-left: 5px;
    margin-right: 0px;
    -qt-block-indent:0;
    text-indent: 0px;
`;

const Span = styled.span `
    font-family:'Lucida Grande';
    font-size:13pt;
    font-style:italic;
    color:#0000ff;
`;

function PaymentInfo() {
    return (
        <div>
            <P><Span>Required payment information</Span></P>
            <br />
            <P><Span>Card Number</Span></P>
            <P>
                <Span>
                    This is usually a 16 digit number on the front of your payment card. 
                    For American Express, it is usually a 15 digit number. 
                    For Diners Club, it is usually a 14 digit number.
                </Span>
            </P>
            <br />
            <P><Span>MM/YY</Span></P>
            <P>
                <Span>
                    This is the expiry date of your payment card, which is usually on the front of your card. 
                    As an example, put 01/22 if the expiry date is January 2022.
                </Span>
            </P>
            <br />
            <P><Span>CVC</Span></P>
            <P>
                <Span>
                    This is the security code on your payment card. If you have an American Express card, 
                    then the security code is usually a 4 digit number on the front of your card, on the 
                    right hand side, above the long card number. If your payment card is not American Express, 
                    then the security code is usually the last 3 digits on the back of your card, where the 
                    signature strip is, or near the signature strip.
                </Span>
            </P>
        </div>
    );
}

export default PaymentInfo;
/* eslint-disable eol-last */