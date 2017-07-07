/**
 * This file defines the life cycle hooks for the Integration Service JS
 */

var controlmAPI = null;

/**
 * This is the method called when the Integration Agent starts
 * this Integration Service.
 * 
 */
function apia_startup()
{
  log.debug("Entered Startup Hook.");
  controlmAPI = new ControlMAPI();
  return true;
}

/**
 * This is the method called when the Integration Agent shut down
 * this Integration Service.
 * <p>
 * For the Autosys integration we will stop the thread which makes periodically
 * checks the ujoj_job_runs table for jobs and shutdown the database connection 
 * pool.
 */
function apia_shutdown()
{
  controlmAPI.done();
  return true;
}

/**
 * This is the method called when the Integration Agent suspends
 * this Integration Service. For example when the below command is executed.
 * <p>
 */
function apia_suspend()
{
  log.debug("Entered Suspend Hook.");
  apia_interrupt();
  return true;
}

/**
 * This is the method called when the Integration Agent suspends
 * this Integration Service. 
 * <p>
 */
function apia_resume()
{
  log.debug("Entered Resume Hook.");
  controlmAPI.initiateAPI();
  controlmAPI.registerAPI();
  return true;
}

/**
 * This is the method called when the Integration Agent interrupts
 * this Integration Service. 
 * <p>
 */
function apia_interrupt()
{
  log.debug("Entered Interrupt Hook.");
  controlmAPI.done();
  return true;
}
