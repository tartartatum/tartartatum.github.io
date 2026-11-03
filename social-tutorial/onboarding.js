/* Reading a procedure never grants access or performs an account action. */
window.ONBOARDING = {
  start: [
    'In Chrome on your PC, open https://cmdglas.com. Account is the first tablet page. Its START HERE panel contains SET UP COMMS and TABLET & SOCIAL GUIDE. You can open the guide without signing in. If you deliberately opened START PAGE from navigation, select Enter Tablet to return.',
    'For the browser version, use the browser window’s minimize button at the top right to hide it; select its Chrome taskbar icon to show it again. No global game hotkey is supplied by the website.',
    'If you already have the separate Windows CmdGlas Overlay installed: select HOTKEYS in its top control strip. In OVERLAY HOTKEYS, find Hide / show the overlay and select SET in that row. Press your chosen combination, check the result, then select Save & apply at the bottom right. With the game closed, press the combination once to hide and again to restore the overlay. This optional procedure does not install the overlay. A current public installer has not been verified; the browser path above needs none.',
    'Select Open tablet sign-in below. If the opening screen appears, select Enter Tablet. In the Sign in panel, select Sign in with Discord. Complete Discord’s sign-in and review the requested authorization in the account you intend to use. New users use the same button. Do not type credentials into this guide.',
    'Return to Social Tools using this guide’s Open in tablet button. Your callsign should replace the dash in the top-right identity pill. If SIGN IN REQUIRED remains, select I’M SIGNED IN — RELOAD in that panel. If it remains after reload, return to tablet sign-in and read its displayed error; do not create another account to bypass it.',
    'On Account, select SET UP COMMS in START HERE to open the built-in setup. In GUIDED SETUP, select SET UP MY PARTY for ordinary play or SET UP MY ORG for organization onboarding. Check Your callsign and Your RSI handle. Use the field’s SAVE control only when changing it. Your RSI handle identifies your game account; the callsign is the name shown in tablet tools. Close the setup when finished. Return to guide, near the bottom-right corner, restores this role page; you can resume the first-task section below.'
  ],
  caution: 'CAUTION — An overlay hotkey can intercept a game key. SC CONFLICT means choose another combination. NOT CHECKED is not proof the key is free. Test while the game is closed. This tutorial does not change keys, permissions, messages or audio for you.',
  partyJoin: [
    'Ask the intended party leader for their tablet party code. A Discord invite or a Star Citizen invitation is not that code.',
    'Open Social Tools, select CHAT in the top bar, then party in CHANNELS on the left. In PARTY OPS above the conversation, find the CODE field next to CREATE PARTY.',
    'Type the supplied code into CODE, then select JOIN immediately to its right. If you are already in a party, check its code first; leaving another party requires your deliberate LEAVE confirmation.',
    'Check that PARTY OPS shows the intended code and both your callsign and the leader’s callsign. Ask the leader to confirm you appear on their roster. The Joined party notice alone does not prove you typed an existing group’s code.',
    'If only your name appears or the leader is missing, compare the code character by character with the leader. Do not claim leadership to repair a mistyped code. If necessary, use LEAVE at the right of PARTY OPS, confirm, and join the corrected code.'
  ],
  roles: {
    'org-leader': {
      title:'Establish leadership, then organize your first squad', destination:'org',
      steps:[
        'Complete Open and sign in above. An existing Wing Commander can transfer leadership to an approved member; otherwise use ORG in the top bar and the BECOME WING COMMANDER card to apply to found an organization.',
        'For a new organization, enter ORG NAME, a valid lowercase ORG ID, optional TAG, and the five founding RSI handles requested by the form, including yours first. Review the optional PIRATE ORG checkbox before choosing it. Select SUBMIT TO SYSTEM ADMIN beneath the form. YOUR ORG — PENDING is an application, not leadership; wait for approval. No approval time is guaranteed.',
        'After approval or a completed handover, reopen ORG. Confirm Wing Commander beside your own roster name and the SQUADRON BOARD. If still pending, read the application status; if denied, the card explains that a different organization can be proposed. Do not create a duplicate while one is pending.',
        'When a genuine applicant appears under APPLICANTS, verify their callsign/RSI handle and request. Choose their rank and squadron in their row, then select Approve at the right of that row. Confirm they appear in the approved squadron board. An empty applicant list means there is nobody to approve.',
        'In an approved pilot’s row, use the Squadron dropdown to choose an existing destination squadron. This saves on selection and clears the old element pairing. Confirm that the pilot appears under the destination heading. Use Rank only when an actual rank change is intended; LEAD makes a squadron leader. Do not use a live member as a test.',
        'At the top of ORG, select Duties & reports, then Chain of command. In Battle Captain or Report inbox manager, choose an approved member and select Save battle captain or Save report inbox manager below that selection. Confirm Assignment saved and the intended name. A blank selection removes that duty.',
        'For a battle party, have the leader and members complete the tablet-party procedure below. Every party member must be approved in your organization. In Chain of command, enter its code in Party code and select Link battle party underneath. Confirm Battle-party link saved and the code listed under Battle parties.'
      ], result:'Your own row is Wing Commander; the intended approved member appears in the intended squadron; each duty/link you actually saved shows the correct name or code.',
      help:'No squadrons or no applicants: do not invent a unit or approve yourself. Wait for genuine applications and use an existing listed squadron. A refused save is not completion. Refresh Duties & reports after a permission error; record the error if it persists. PIRATE ORG and command transfer have real consequences; this guide does not trigger either.'
    },
    'squadron-leader': {
      title:'Confirm command access and issue an agreed squadron order',destination:'org',
      steps:[
        'Complete sign-in. Organization command must approve your membership and assign Squadron Leader using your Rank dropdown or the LEAD button on the ORG squadron board. Selecting this tutorial role does not assign it.',
        'Open ORG at the top. Confirm Squadron Leader beside your roster name and your intended squadron. Open WING to compare the organization hierarchy. If either is wrong, ask organization command to correct the roster.',
        'Return to ORG. The current command-tier interface exposes the organization’s squadron board, not just one squadron. Select only the squadron you were authorized to coordinate; select its heading if folded.',
        'Under that squadron heading, find ORDERS. Choose the agreed task in the dropdown, enter the intended target in the adjacent target field, then select SET to their right. This sends a real order; do not submit a practice order during an operation.',
        'Check the task and target shown on that squadron’s heading. Read each pilot’s order-response chip on the board. An order set successfully and a pilot acknowledgement are separate results.'
      ],result:'The intended squadron displays the agreed task and target. Pilot responses appear as they reply; no response is not acknowledgement.',
      help:'Missing command board: check approved membership and actual rank first. No formed squadron: ask organization command to assign one; the Unassigned group has no orders bar. Do not interpret wider visible controls as an instruction to change another squadron.'
    },
    'flight-lead': {
      title:'Confirm your flight and check its assigned pilots',destination:'org',
      steps:[
        'Complete sign-in and obtain approved organization membership. Organization command assigns Flight Lead in your Rank dropdown and selects your Squadron on the ORG board.',
        'Open ORG in the top bar. Confirm your rank and squadron, then scroll below the roster to FLIGHT LEAD — followed by your squadron’s name. The panel lists approved members of that squadron, excluding Wing Commander.',
        'Read the OBJECTIVE, order and YOUR SEAT when present. Under YOUR FLIGHT, compare the pilots and seats with the assignment command gave you. Empty objective/seat fields mean no assignment is shown; request one before assuming a task.',
        'If authorized to set a tactical callsign, open the panel’s CALLSIGN MENU. In the intended pilot’s tac callsign field, enter the agreed name and select SET on the same row. Check the name beside that same pilot after the board refreshes. The inspected server rule grants Flight Lead callsign changes within their own squadron; it does not grant seat or rank changes.',
        'To contact a displayed pilot, select the envelope beside their row. It opens CHAT with their name prepared. Check the channel shown above the composer before writing or selecting SEND. This is a shared-channel shortcut, not a private message.'
      ],result:'FLIGHT LEAD shows the intended squadron and pilots. Any callsign you deliberately saved appears beside the intended pilot; an envelope alone sends nothing.',
      help:'No panel: approved membership, Flight Lead rank and a squadron assignment are all required. Ask command to check all three. Incorrect seats require command correction. If a callsign save is refused or does not persist after reopening, leave it unconfirmed and report the error.'
    },
    'element-lead': {
      title:'Confirm your element and read its first assignment',destination:'org',
      steps:[
        'Complete sign-in and obtain approved membership. Organization command assigns Element Lead and your Squadron on ORG. Command then selects you in Assign to an element lead for the pilots who should follow you.',
        'Open ORG in the top bar and scroll below the roster to ELEMENT LEAD — followed by your squadron name. Confirm your own row and only the pilots assigned to you within that squadron.',
        'Read the OBJECTIVE, squadron order and YOUR SEAT when shown. Compare the listed pilots’ seat and response chips with your assignment. If no objective or pilots are assigned, ask command to finish the assignment; do not infer one.',
        'For contact, select the envelope beside a displayed pilot. CHAT opens with the name prepared. Check the channel above the text box before typing or selecting SEND; it is not a private-message control.',
        'Request tactical callsign changes from the Flight Lead or command. Although this panel currently shows a CALLSIGN MENU, the inspected server rule grants other-pilot callsign edits to Flight Lead, not Element Lead alone. Do not use that menu as proof of authority.'
      ],result:'Your ELEMENT LEAD panel shows the correct squadron, you and your assigned pilots, with the current order/seat information that command has provided.',
      help:'Missing panel: ask command to verify approved status, Element Lead rank and Squadron. Missing follower: ask command to check that pilot’s Squadron and Assign to an element lead selection. A rank label alone does not create those assignments.'
    },
    'wingman': {
      title:'Find your assignment and answer an order',destination:'org',
      steps:[
        'Complete sign-in. If you have not joined an organization, complete the inline JOIN AN ORG procedure below. Command must approve you and choose Wingman plus your squadron; a pending Recruit application is not approval.',
        'Open ORG and find your callsign. Confirm Wingman and the intended squadron. Select WING in the top bar to see your place in the hierarchy and any element assignment.',
        'Open CHAT in the top bar. Read your order strip when an order is present: objective, task, target and seat. If no order is shown, request an assignment from command rather than acknowledging an imagined order.',
        'If you understand and can perform the displayed order, select o7 in that order strip. If you cannot, enter the reason in its reason field, then select UNABLE beside it.',
        'Check your acknowledgement on the order display and ask command to confirm your row shows your reply. A later changed order needs its own response. o7 means acknowledged; it does not mark the objective completed.'
      ],result:'Your actual organization assignment is visible and the current order shows the response you deliberately submitted.',
      help:'No organization roster: check application status under ORG. No squadron/order: ask command to assign it. A saved reply to an earlier order does not acknowledge a new one. Do not post sensitive content to General or Party text; both use the shared gamer pool.'
    },
    'recruit': {
      title:'Apply to an organization and find the result',destination:'org',
      steps:[
        'Complete Open and sign in above, then open ORG in the top bar of Social Tools.',
        'In JOIN AN ORG, choose the intended organization in ORG. Enter your RSI HANDLE and CALLSIGN. Add NOTE TO COMMAND if wanted. Check the organization name and any PIRATE notice before continuing.',
        'Select SEND REQUEST beneath the form. Read any error beside the form; required missing fields must be completed before submitting.',
        'Look for APPLICATION PENDING and the correct organization name. Organization command reviews individual applications. A pending application does not give organization chat or command access.',
        'Return to ORG later. After approval, the roster replaces the application view; find your callsign, rank and squadron, then open WING. If a request is denied or no longer appears, check with that organization’s command before submitting again. Do not assume a disappearing pending card proves approval.'
      ],result:'APPLICATION PENDING shows the requested organization, or an approved roster shows your actual membership and assignment.',
      help:'No organizations listed: none are available in the directory; you can use public CHAT or the tablet-party steps while waiting. NOT RECRUITING means choose another recruiting organization or contact its command. A disabled SEND REQUEST requires ORG, RSI HANDLE and CALLSIGN.'
    },
    'battle-captain': {
      title:'Confirm your delegated duty and coordinate the first squad',destination:'org',
      steps:[
        'Complete sign-in and obtain approved membership in the organization. The Wing Commander opens ORG → Duties & reports → Chain of command, selects your name under Battle Captain and selects Save battle captain. A rank promotion is not required.',
        'Open ORG, then Duties & reports near the top, then Chain of command. Select Refresh and confirm your name under Battle Captain. Select Open organization command in that dialog.',
        'For a first squad transfer, return to ORG and locate the approved pilot’s row on SQUADRON BOARD. With command’s agreement, select the destination in that row’s Squadron dropdown. It saves on selection. Confirm the row moves to the correct heading; the previous element pairing is cleared.',
        'For an operational order, expand the intended squadron heading. Under ORDERS, choose the agreed task, enter its target and select SET at the right of those fields. Confirm the task and target on that squadron’s heading and separately check pilot replies.',
        'For delegated party command, the Wing Commander first links its code in Chain of command → Party code → Link battle party. Every member must be approved in this organization. Return to your Chain of command and select Refresh; select Open party command beside the intended linked code. Check the roster before coordinating.'
      ],result:'Your name is the assigned Battle Captain; the intended squad move or order appears; eligible linked-party command shows the intended party roster.',
      help:'Missing or revoked duty: Refresh and ask the Wing Commander to verify the saved assignment. Delegated command unavailable: the leader must verify the link and every party member’s approved organization membership. A foreign member removes delegated access; do not remove or reclassify people just to bypass the guard. This duty cannot approve applicants, change ranks, assign duties, take party ownership or read reports by itself.'
    },
    'report-manager': {
      title:'Open the inbox and record one review',destination:'org',
      steps:[
        'Complete tablet sign-in and obtain approved organization membership. No game, party or voice connection is required for this duty.',
        'The Wing Commander opens ORG → Duties & reports → Chain of command, chooses your approved name under Report inbox manager and selects Save report inbox manager. They confirm Assignment saved.',
        'Open ORG, select Duties & reports near the top, then Refresh. Confirm the assignment in Chain of command, then select Report inbox in the dialog’s top navigation.',
        'If the inbox says No reports in this inbox, there is nothing to review. Otherwise read the subject, Type/category and report body. Organization reviewers cannot see the sender’s account identity, although the text may identify them.',
        'For a genuine report you are handling, choose reviewing or resolved in that report’s Status dropdown and enter Review notes beneath it. Select Save review on that report. Check Review saved and the retained status/notes after Refresh.',
        'For older items, select Load older items below the list when offered. Threat or harassment escalation is a Wing Commander action; notify the leader through your organization’s agreed private process without copying the report into public chat.'
      ],result:'Report inbox loads; either it is explicitly empty or the intended report retains the status and review notes you saved.',
      help:'Report inbox missing or Inbox access denied: verify the correct signed-in account, approved organization and saved report-manager assignment with the leader. Use Refresh once after the correction. Not saved or a changed revision means reread the current report before deciding on another update. Loading is not an empty inbox.'
    },
    'party-leader': {
      title:'Create a tablet party and confirm your first member',destination:'party',
      steps:[
        'Complete Open and sign in above. In Social Tools select CHAT in the top bar, then party under CHANNELS on the left.',
        'In PARTY OPS above the conversation, check that you are not already in the intended party. If there is no party, select CREATE PARTY at the left of that panel. Check the generated party code beside PARTY OPS and the leader star beside your own callsign.',
        'Give that tablet code to the intended member through your chosen communication channel. This guide does not send it. General and Party text are shared gamer-pool channels, so do not treat a post there as a private invitation.',
        'Have the member complete Join a tablet party below: CODE field, JOIN, then roster check. On your own PARTY OPS roster, confirm their correct callsign appears under the same code. They must independently check that you appear on their roster.',
        'Open PARTY CMD in the top bar to inspect this party’s command view. Optional Discord voice is explained separately below; creating the tablet party does not create a game party or connect a microphone.',
        'If handing over leadership deliberately, select the paired-arrow control beside the intended member in PARTY OPS (tooltip: Hand off party lead). Read and accept the handover confirmation only for the correct person. Verify the leader star moves to them and you become a member.'
      ],result:'Both intended callsigns appear under the same tablet code, with the leader star on the correct person.',
      help:'No CREATE PARTY: check the existing PARTY OPS code; you may already belong to a party. Loading your pilot row means wait for account data or read the service error. Do not repeatedly create groups. Missing member: compare the entered code before changing leadership.'
    },
    'party-member': {
      title:'Join the intended tablet party',destination:'party',
      steps:[],result:'Your name and the intended leader appear in PARTY OPS under the same code, and the leader confirms your row on their roster.',
      help:'A success notice with only your own name can indicate a mistyped code. Compare with the leader and use the correction procedure below. No game session or Discord voice is implied. PARTY CMD is a read view for regular members; leader-only management stays with the leader.'
    },
    'app-admin': {
      title:'Open an authorized admin inbox and record a review',destination:'org',
      steps:[
        'Use an existing account authorized by the site operator as an app administrator, then complete tablet sign-in above. Choosing this role in the guide cannot grant administration. No game or Discord voice connection is required.',
        'Open ORG in the top bar. The authorized organization-application console appears there, including when an admin also has organization membership. Duties & reports near the top provides the separate escalated-report inbox.',
        'Select Duties & reports, then Refresh, then Admin alerts in the dialog’s top navigation. No escalations in this inbox means the queue is empty; do not manufacture a report to test it.',
        'For a genuine escalation, read the report, organization, Flag reason, Account ID and current Status. This account identity is visible for administrator review, not to ordinary organization reviewers.',
        'To begin review, choose Mark under review in that item’s Admin action dropdown. Enter Review reason underneath, then select Apply admin action on that item. Confirm Admin action recorded and its updated status after Refresh.',
        'Dismiss escalation, Restrict account from submitting reports and Restore reporting access are different deliberate actions in the same dropdown. Restriction affects reporting access; it is not a game ban. Choose one only after reviewing the report and entering the reason.'
      ],result:'The authorized Admin alerts queue loads, and a real review action you deliberately took appears with its recorded outcome; an empty queue is an explicit valid result.',
      help:'No admin console or Admin alerts: check the intended signed-in account with the site operator. A normal organization leader is not automatically an app admin. Access denied cannot be fixed by selecting another tutorial role. On a failed or stale save, refresh and reread the report before acting again.'
    }
  }
};
window.ONBOARDING.roles['party-member'].steps = ['Complete Open and sign in above.'].concat(window.ONBOARDING.partyJoin);
