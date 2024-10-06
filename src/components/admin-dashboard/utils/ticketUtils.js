// ./utils/ticketutils.js
import { fetchUserAttributes } from 'aws-amplify/auth';
import { fetchSupportTickets, issueReplacement, addCreditViaTicket, logRequest, resolveOrDenyTicket } from '../../../utils/api';

export const fetchOperatorEmail = async () => {
  const userResponse = await fetchUserAttributes();
  const { email } = userResponse;
  return email;
};

export const fetchOperatorUserId = async () => {
  const response = await fetchUserAttributes();
  const { sub } = response;
  return sub;
};

export const handleIssueReplacement = async (replacementData) => {
  try {
    await issueReplacement(replacementData);
    return 'Issue replacement request submitted successfully!';
  } catch (error) {
    throw new Error('Failed to submit issue replacement.');
  }
};

export const handleCredit = async (creditData, operatorUserId) => {
  try {
    const logSuccess = await logRequest('Matrix_AddCredit', operatorUserId);
    if (!logSuccess) throw new Error('Failed to log the add credit request.');

    const response = await addCreditViaTicket(creditData);
    if (response.statusCode === 200) {
      return 'Credit added successfully!';
    } else {
      const parsedResponse = JSON.parse(response.body);
      throw new Error(`Failed to add credit: ${parsedResponse.message || 'Unknown error'}`);
    }
  } catch (error) {
    throw error;
  }
};

export const handleResolveDeny = async (resolveDenyData) => {
  try {
    const response = await resolveOrDenyTicket(resolveDenyData);
    if (response.statusCode === 200) {
      return `Ticket ${resolveDenyData.status} successfully!`;
    } else {
      throw new Error('Failed to update ticket status.');
    }
  } catch (error) {
    throw error;
  }
};


export const toggleFilters = (setFiltersVisible, filtersVisible) => {
    setFiltersVisible(!filtersVisible);
  };