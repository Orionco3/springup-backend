module.exports = {
    // 1. accountVerificationEmailTemplate
    accountVerificationEmailTemplate: `
       Hi,
            <p>Thank you for creating an account with Digno.</p>
            <p>
            Your email address is not yet verified. To Launch Digno , please click this link to verify your email
            <a href = {{url}}>Click Here</a></p>
            <p>
            If you have further questions, please do not hesitate to ask:)
            </p>
            <p>
            All the best</p>
       `, // 1. resetPasswordEmailTemplate
    resetPasswordEmailTemplate: `
         Hi,
              <p>Forget Pass Key.</p>
              <p>
              Your email address is not yet verified. To Launch Digno , please click this link to verify your email
              <a href = {{url}}>Click Here</a></p>
              <p>
              If you have further questions, please do not hesitate to ask:)
              </p>
              <p>
              All the best</p>
         `,
    newCompanyInvitationEmailTemplate: `Hi,
         <p>Thank you for creating an account with Digno.</p>

         <p>
           email :  {{email}}
         <p>

         <p>
         password :  {{password}}
         <p>

         <p>
         Your email address is not yet verified. To Launch Digno , please click this link to verify your email
         <a href = {{url}}>Click Here</a></p>
         <p>
         If you have further questions, please do not hesitate to ask:)
         </p>
         <p>
         All the best</p>
         `,
         rejectJobEmail: `Hi,
         <p>Thank you for Using Snap Hire.</p>
         
         <H4> {{title}} </H4>
         <p> Job manager reject your job application. </p>
        
         <p> Dont worry snap Hire find fit job for your soon </p> 

         <p>
         All the best</p>
         `,
};
